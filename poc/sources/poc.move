module poc::poc {
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::event;
    use std::string::{String, utf8};
    use std::vector;
    use sui::clock::{Clock};

    // === Errors ===
    const ENotAuthorized: u64 = 0;
    const ETaskNotActive: u64 = 2;
    const ESubmissionAlreadyApproved: u64 = 3;
    const ADMIN_ADDRESS: address = @0xeec802d4e8e8d86a0258702d31d1932ef17226164dee712d397c5ef41aad0dfe;

    // === Structs ===

    /// Admin capability to manage verifiers
    public struct AdminCap has key, store {
        id: UID
    }

    /// Capability given to organizations to verify student contributions
    public struct VerifierCap has key, store {
        id: UID,
        org_name: String
    }

    /// The student's proof of contribution profile (Soulbound)
    public struct StudentProfile has key {
        id: UID,
        owner: address,
        name: String,
        student_id: String,
        university: String,
        total_points: u64,
        contributions: vector<Contribution>
    }

    /// Details of a specific contribution
    public struct Contribution has store, drop, copy {
        title: String,
        description: String,
        category: String, // e.g., "Hackathon", "Volunteer", "Research"
        points: u64,
        timestamp: u64,
        verified_by: String
    }

    /// Represents a task or quest posted by an organization
    public struct Task has key {
        id: UID,
        title: String,
        description: String,
        category: String,
        points: u64,
        creator: String,
        is_active: bool
    }

    /// Status constants for TaskSubmission
    const STATUS_PENDING: u8 = 0;
    const STATUS_APPROVED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;

    /// A student's submission for a task
    public struct TaskSubmission has key {
        id: UID,
        task_id: ID,
        student_id: ID, // StudentProfile ID
        student_address: address,
        proof_url: String,
        status: u8,
        comment: String
    }

    // === Events ===

    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        owner: address
    }

    public struct ContributionAdded has copy, drop {
        profile_id: ID,
        title: String,
        points: u64
    }

    public struct TaskCreated has copy, drop {
        task_id: ID,
        title: String,
        creator: String
    }

    public struct TaskUpdated has copy, drop {
        task_id: ID,
        title: String,
        is_active: bool
    }

    public struct TaskDeleted has copy, drop {
        task_id: ID
    }

    public struct TaskSubmitted has copy, drop {
        submission_id: ID,
        task_id: ID,
        student_address: address
    }

    public struct SubmissionApproved has copy, drop {
        submission_id: ID,
        task_id: ID,
        student_id: ID,
        points: u64
    }

    public struct SubmissionRejected has copy, drop {
        submission_id: ID,
        task_id: ID,
        student_id: ID,
        reason: String
    }

    // === Initializer ===

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx)
        }, ADMIN_ADDRESS);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }

    // === Admin Functions ===

    /// Admin issues a VerifierCap to an organization
    public fun issue_verifier_cap(
        _: &AdminCap,
        org_name: String,
        recipient: address,
        ctx: &mut TxContext
    ) {
        transfer::transfer(VerifierCap {
            id: object::new(ctx),
            org_name
        }, recipient);
    }

    /// Admin creates a new public task (as the protocol itself)
    public fun admin_create_task(
        _: &AdminCap,
        title: String,
        description: String,
        category: String,
        points: u64,
        ctx: &mut TxContext
    ) {
        let task = Task {
            id: object::new(ctx),
            title,
            description,
            category,
            points,
            creator: utf8(b"Protocol Admin"),
            is_active: true
        };

        event::emit(TaskCreated {
            task_id: object::id(&task),
            title,
            creator: utf8(b"Protocol Admin")
        });

        transfer::share_object(task);
    }

    /// Admin edits any public task
    public fun admin_update_task(
        _: &AdminCap,
        task: &mut Task,
        title: String,
        description: String,
        category: String,
        points: u64,
        is_active: bool
    ) {
        task.title = title;
        task.description = description;
        task.category = category;
        task.points = points;
        task.is_active = is_active;

        event::emit(TaskUpdated {
            task_id: object::id(task),
            title,
            is_active
        });
    }

    /// Admin permanently deletes any public task
    public fun admin_delete_task(
        _: &AdminCap,
        task: Task
    ) {
        let task_id = object::id(&task);
        let Task {
            id,
            title: _,
            description: _,
            category: _,
            points: _,
            creator: _,
            is_active: _
        } = task;
        object::delete(id);

        event::emit(TaskDeleted { task_id });
    }

    /// Admin marks a task as completed for a specific student
    public fun admin_complete_task(
        _: &AdminCap,
        profile: &mut StudentProfile,
        task: &Task,
        clock: &Clock
    ) {
        let contribution = Contribution {
            title: task.title,
            description: task.description,
            category: task.category,
            points: task.points,
            timestamp: sui::clock::timestamp_ms(clock),
            verified_by: utf8(b"Protocol Admin")
        };

        vector::push_back(&mut profile.contributions, contribution);
        profile.total_points = profile.total_points + task.points;

        event::emit(ContributionAdded {
            profile_id: object::id(profile),
            title: task.title,
            points: task.points
        });
    }

    // === Student Functions ===

    /// Create a new student profile
    public fun create_profile(
        name: String,
        student_id: String,
        university: String,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let profile = StudentProfile {
            id: object::new(ctx),
            owner,
            name,
            student_id,
            university,
            total_points: 0,
            contributions: vector::empty()
        };

        event::emit(ProfileCreated {
            profile_id: object::id(&profile),
            owner
        });

        transfer::share_object(profile);
    }

    /// Student submits a task with proof
    public fun submit_task(
        profile: &StudentProfile,
        task: &Task,
        proof_url: String,
        ctx: &mut TxContext
    ) {
        assert!(task.is_active, ETaskNotActive);
        assert!(profile.owner == tx_context::sender(ctx), ENotAuthorized);

        let submission = TaskSubmission {
            id: object::new(ctx),
            task_id: object::id(task),
            student_id: object::id(profile),
            student_address: profile.owner,
            proof_url,
            status: STATUS_PENDING,
            comment: utf8(b"")
        };

        event::emit(TaskSubmitted {
            submission_id: object::id(&submission),
            task_id: object::id(task),
            student_address: profile.owner
        });

        transfer::share_object(submission);
    }

    // === Verifier Functions ===

    /// Verifier adds a verified contribution to a student's profile
    public fun verify_contribution(
        cap: &VerifierCap,
        profile: &mut StudentProfile,
        title: String,
        description: String,
        category: String,
        points: u64,
        clock: &Clock
    ) {
        let contribution = Contribution {
            title,
            description,
            category,
            points,
            timestamp: sui::clock::timestamp_ms(clock),
            verified_by: cap.org_name
        };

        vector::push_back(&mut profile.contributions, contribution);
        profile.total_points = profile.total_points + points;

        event::emit(ContributionAdded {
            profile_id: object::id(profile),
            title,
            points
        });
    }

    /// Verifier creates a new public task
    public fun create_task(
        cap: &VerifierCap,
        title: String,
        description: String,
        category: String,
        points: u64,
        ctx: &mut TxContext
    ) {
        let task = Task {
            id: object::new(ctx),
            title,
            description,
            category,
            points,
            creator: cap.org_name,
            is_active: true
        };

        event::emit(TaskCreated {
            task_id: object::id(&task),
            title,
            creator: cap.org_name
        });

        transfer::share_object(task);
    }

    /// Verifier marks a task as completed for a specific student and adds the contribution
    public fun complete_task(
        cap: &VerifierCap,
        profile: &mut StudentProfile,
        task: &Task,
        clock: &Clock
    ) {
        let contribution = Contribution {
            title: task.title,
            description: task.description,
            category: task.category,
            points: task.points,
            timestamp: sui::clock::timestamp_ms(clock),
            verified_by: cap.org_name
        };

        vector::push_back(&mut profile.contributions, contribution);
        profile.total_points = profile.total_points + task.points;

        event::emit(ContributionAdded {
            profile_id: object::id(profile),
            title: task.title,
            points: task.points
        });
    }

    /// Verifier deactivates a task
    public fun deactivate_task(
        cap: &VerifierCap,
        task: &mut Task
    ) {
        assert!(task.creator == cap.org_name, ENotAuthorized);
        task.is_active = false;
    }

    // === Submission Review Functions ===

    /// Admin approves a submission
    public fun admin_approve_submission(
        _: &AdminCap,
        submission: &mut TaskSubmission,
        profile: &mut StudentProfile,
        task: &Task,
        clock: &Clock
    ) {
        review_submission_internal(submission, profile, task, STATUS_APPROVED, utf8(b"Approved by Admin"), utf8(b"Protocol Admin"), clock);
    }

    /// Verifier approves a submission
    public fun verifier_approve_submission(
        cap: &VerifierCap,
        submission: &mut TaskSubmission,
        profile: &mut StudentProfile,
        task: &Task,
        clock: &Clock
    ) {
        // Ensure the verifier is the one who created the task (optional, or any verifier can approve?)
        // For now, let's allow any authorized verifier to approve.
        review_submission_internal(submission, profile, task, STATUS_APPROVED, utf8(b"Approved by Verifier"), cap.org_name, clock);
    }

    /// Admin rejects a submission
    public fun admin_reject_submission(
        _: &AdminCap,
        submission: &mut TaskSubmission,
        reason: String
    ) {
        reject_submission_internal(submission, reason);
    }

    /// Verifier rejects a submission
    public fun verifier_reject_submission(
        _: &VerifierCap,
        submission: &mut TaskSubmission,
        reason: String
    ) {
        reject_submission_internal(submission, reason);
    }

    // === Internal Functions ===

    fun review_submission_internal(
        submission: &mut TaskSubmission,
        profile: &mut StudentProfile,
        task: &Task,
        status: u8,
        comment: String,
        verified_by: String,
        clock: &Clock
    ) {
        assert!(submission.status == STATUS_PENDING, ESubmissionAlreadyApproved);
        assert!(submission.task_id == object::id(task), ENotAuthorized);
        assert!(submission.student_id == object::id(profile), ENotAuthorized);

        submission.status = status;
        submission.comment = comment;

        if (status == STATUS_APPROVED) {
            let contribution = Contribution {
                title: task.title,
                description: task.description,
                category: task.category,
                points: task.points,
                timestamp: sui::clock::timestamp_ms(clock),
                verified_by
            };

            vector::push_back(&mut profile.contributions, contribution);
            profile.total_points = profile.total_points + task.points;

            event::emit(SubmissionApproved {
                submission_id: object::id(submission),
                task_id: object::id(task),
                student_id: object::id(profile),
                points: task.points
            });

            event::emit(ContributionAdded {
                profile_id: object::id(profile),
                title: task.title,
                points: task.points
            });
        };
    }

    fun reject_submission_internal(
        submission: &mut TaskSubmission,
        reason: String
    ) {
        assert!(submission.status == STATUS_PENDING, ESubmissionAlreadyApproved);
        submission.status = STATUS_REJECTED;
        submission.comment = reason;

        event::emit(SubmissionRejected {
            submission_id: object::id(submission),
            task_id: submission.task_id,
            student_id: submission.student_id,
            reason
        });
    }

    // === Getters ===

    public fun total_points(profile: &StudentProfile): u64 {
        profile.total_points
    }

    public fun contribution_count(profile: &StudentProfile): u64 {
        vector::length(&profile.contributions)
    }
}
