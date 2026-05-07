module poc::poc {
    use sui::tx_context::TxContext;
    use sui::object::{UID, ID};
    use sui::transfer;
    use sui::event;
    use std::string::{String, utf8};
    use std::vector;
    use sui::clock::{Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use std::option::{Self, Option};

    // === Errors ===
    const ENotAuthorized: u64 = 0;
    const ETaskNotActive: u64 = 2;
    const ESubmissionAlreadyApproved: u64 = 3;
    const EInsufficientFunds: u64 = 4;
    const ETaskExpired: u64 = 6;

    public struct VerifierPurchased has copy, drop {
        cap_id: ID,
        org_name: String,
        owner: address,
        expires_at: u64
    }

    public struct VerifierRenewed has copy, drop {
        cap_id: ID,
        new_expires_at: u64
    }
    const EVerifierExpired: u64 = 5;
    const VERIFIER_PRICE: u64 = 50000000; // 0.05 SUI for testing
    const SUBSCRIPTION_DURATION: u64 = 2592000000; // 30 days in ms
    const ADMIN_ADDRESS: address = @0xeec802d4e8e8d86a0258702d31d1932ef17226164dee712d397c5ef41aad0dfe;

    const DEFAULT_REPUTATION: u64 = 100;
    const MAX_REPUTATION: u64 = 1000;
    const MIN_REPUTATION_PENALTY: u64 = 10;

    // === Structs ===

    /// Admin capability to manage verifiers
    public struct AdminCap has key, store {
        id: UID
    }

    /// Capability given to organizations to verify student contributions
    public struct VerifierCap has key, store {
        id: UID,
        org_name: String,
        expires_at: u64
    }

    /// The student's proof of contribution profile (Soulbound)
    public struct StudentProfile has key {
        id: UID,
        owner: address,
        name: String,
        student_id: String,
        university: String,
        total_points: u64,
        reputation: u64,
        badges: vector<String>,
        goals: vector<Goal>,
        contributions: vector<Contribution>
    }

    public struct Goal has store, drop, copy {
        title: String,
        target_points: u64,
        current_points: u64,
        deadline: u64
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
        is_active: bool,
        rubric: vector<String>,
        min_reputation: u64,
        requires_double_check: bool,
        deadline: u64
    }

    /// Global configuration and statistics
    public struct GlobalConfig has key {
        id: UID,
        skills: vector<String>,
        reward_policy: Table<u64, u64>, // difficulty -> bonus
        penalty_points: u64,
        total_tasks: u64,
        total_submissions: u64,
        approved_submissions: u64
    }

    /// Capability for sub-admins to manage specific domains
    public struct SubAdminCap has key, store {
        id: UID,
        domain: String
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
        comment: String,
        approvers: vector<address>,
        submitted_at: u64,
        evidence_requests: vector<String>
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

        let mut reward_policy = table::new<u64, u64>(ctx);
        table::add(&mut reward_policy, 1, 0); // Easy
        table::add(&mut reward_policy, 2, 50); // Medium
        table::add(&mut reward_policy, 3, 150); // Hard

        transfer::share_object(GlobalConfig {
            id: object::new(ctx),
            skills: vector[utf8(b"Coding"), utf8(b"Design"), utf8(b"Research"), utf8(b"Writing")],
            reward_policy,
            penalty_points: 20,
            total_tasks: 0,
            total_submissions: 0,
            approved_submissions: 0
        });
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }

    // === Admin Functions ===

    public fun issue_verifier_cap(
        _: &AdminCap,
        org_name: String,
        recipient: address,
        ctx: &mut TxContext
    ) {
        transfer::transfer(VerifierCap {
            id: object::new(ctx),
            org_name,
            expires_at: 1000000000000000 // Decades from now
        }, recipient);
    }

    /// Admin can revoke a VerifierCap (if they have the object, e.g. via PTB)
    /// Note: In a real app, you might use a registry or shared object for easier revoking.
    public fun revoke_verifier_cap(
        _: &AdminCap,
        cap: VerifierCap
    ) {
        let VerifierCap { id, org_name: _, expires_at: _ } = cap;
        object::delete(id);
    }

    /// Admin creates a new public task (as the protocol itself)
    public fun admin_create_task(
        _: &AdminCap,
        config: &mut GlobalConfig,
        title: String,
        description: String,
        category: String,
        points: u64,
        rubric: vector<String>,
        min_reputation: u64,
        requires_double_check: bool,
        deadline: u64,
        ctx: &mut TxContext
    ) {
        let task = Task {
            id: object::new(ctx),
            title,
            description,
            category,
            points,
            creator: utf8(b"Protocol Admin"),
            is_active: true,
            rubric,
            min_reputation,
            requires_double_check,
            deadline
        };

        config.total_tasks = config.total_tasks + 1;

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
        is_active: bool,
        rubric: vector<String>,
        min_reputation: u64,
        requires_double_check: bool,
        deadline: u64
    ) {
        task.title = title;
        task.description = description;
        task.category = category;
        task.points = points;
        task.is_active = is_active;
        task.rubric = rubric;
        task.min_reputation = min_reputation;
        task.requires_double_check = requires_double_check;
        task.deadline = deadline;

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
            is_active: _,
            rubric: _,
            min_reputation: _,
            requires_double_check: _,
            deadline: _
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
            reputation: DEFAULT_REPUTATION,
            badges: vector::empty(),
            goals: vector::empty(),
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
        config: &mut GlobalConfig,
        proof_url: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(task.is_active, ETaskNotActive);
        assert!(profile.owner == tx_context::sender(ctx), ENotAuthorized);
        assert!(profile.reputation >= task.min_reputation, ENotAuthorized);
        assert!(sui::clock::timestamp_ms(clock) <= task.deadline, ETaskExpired);

        let submission = TaskSubmission {
            id: object::new(ctx),
            task_id: object::id(task),
            student_id: object::id(profile),
            student_address: profile.owner,
            proof_url,
            status: STATUS_PENDING,
            comment: utf8(b""),
            approvers: vector::empty(),
            submitted_at: sui::clock::timestamp_ms(clock),
            evidence_requests: vector::empty()
        };

        config.total_submissions = config.total_submissions + 1;

        event::emit(TaskSubmitted {
            submission_id: object::id(&submission),
            task_id: object::id(task),
            student_address: profile.owner
        });

        transfer::share_object(submission);
    }

    // === Verifier Functions ===

    /// Helper to check if a verifier cap is still valid
    fun check_verifier_expiry(cap: &VerifierCap, clock: &Clock) {
        assert!(sui::clock::timestamp_ms(clock) < cap.expires_at, EVerifierExpired);
    }

    /// Purchase a VerifierCap by paying 5 SUI for 30 days
    public fun purchase_verifier_cap(
        payment: &mut Coin<SUI>,
        org_name: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let paid = coin::split(payment, VERIFIER_PRICE, ctx);
        transfer::public_transfer(paid, ADMIN_ADDRESS);
        
        let recipient = tx_context::sender(ctx);
        let expires_at = sui::clock::timestamp_ms(clock) + SUBSCRIPTION_DURATION;
        let id = object::new(ctx);
        let cap_id = object::uid_to_inner(&id);

        event::emit(VerifierPurchased {
            cap_id,
            org_name,
            owner: recipient,
            expires_at
        });

        transfer::transfer(VerifierCap {
            id,
            org_name,
            expires_at
        }, recipient);
    }

    /// Renew an existing VerifierCap for another 30 days
    public fun renew_verifier_cap(
        cap: &mut VerifierCap,
        payment: &mut Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let paid = coin::split(payment, VERIFIER_PRICE, ctx);
        transfer::public_transfer(paid, ADMIN_ADDRESS);
        
        let now = sui::clock::timestamp_ms(clock);
        if (now > cap.expires_at) {
            cap.expires_at = now + SUBSCRIPTION_DURATION;
        } else {
            cap.expires_at = cap.expires_at + SUBSCRIPTION_DURATION;
        };

        event::emit(VerifierRenewed {
            cap_id: object::uid_to_inner(&cap.id),
            new_expires_at: cap.expires_at
        });
    }

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
        check_verifier_expiry(cap, clock);
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
        config: &mut GlobalConfig,
        title: String,
        description: String,
        category: String,
        points: u64,
        rubric: vector<String>,
        min_reputation: u64,
        requires_double_check: bool,
        deadline: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        check_verifier_expiry(cap, clock);
        let task = Task {
            id: object::new(ctx),
            title,
            description,
            category,
            points,
            creator: cap.org_name,
            is_active: true,
            rubric,
            min_reputation,
            requires_double_check,
            deadline
        };

        config.total_tasks = config.total_tasks + 1;

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
        check_verifier_expiry(cap, clock);
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
        task: &mut Task,
        clock: &Clock
    ) {
        check_verifier_expiry(cap, clock);
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
        config: &mut GlobalConfig,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        review_submission_internal(submission, profile, task, config, STATUS_APPROVED, utf8(b"Approved by Admin"), utf8(b"Protocol Admin"), tx_context::sender(ctx), clock);
    }

    /// Verifier approves a submission
    public fun verifier_approve_submission(
        cap: &VerifierCap,
        submission: &mut TaskSubmission,
        profile: &mut StudentProfile,
        task: &Task,
        config: &mut GlobalConfig,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        check_verifier_expiry(cap, clock);
        review_submission_internal(submission, profile, task, config, STATUS_APPROVED, utf8(b"Approved by Verifier"), cap.org_name, tx_context::sender(ctx), clock);
    }

    /// Admin rejects a submission
    public fun admin_reject_submission(
        _: &AdminCap,
        submission: &mut TaskSubmission,
        profile: &mut StudentProfile,
        config: &GlobalConfig,
        reason: String
    ) {
        reject_submission_internal(submission, profile, config, reason);
    }

    /// Verifier rejects a submission
    public fun verifier_reject_submission(
        cap: &VerifierCap,
        submission: &mut TaskSubmission,
        profile: &mut StudentProfile,
        config: &GlobalConfig,
        reason: String,
        clock: &Clock
    ) {
        check_verifier_expiry(cap, clock);
        reject_submission_internal(submission, profile, config, reason);
    }

    // === Internal Functions ===

    fun review_submission_internal(
        submission: &mut TaskSubmission,
        profile: &mut StudentProfile,
        task: &Task,
        config: &mut GlobalConfig,
        status: u8,
        comment: String,
        verified_by: String,
        verifier_address: address,
        clock: &Clock
    ) {
        assert!(submission.status == STATUS_PENDING, ESubmissionAlreadyApproved);
        assert!(submission.task_id == object::id(task), ENotAuthorized);
        assert!(submission.student_id == object::id(profile), ENotAuthorized);

        // Check if verifier already approved
        assert!(!vector::contains(&submission.approvers, &verifier_address), ENotAuthorized);
        vector::push_back(&mut submission.approvers, verifier_address);

        let required_approvals = if (task.requires_double_check) 2 else 1;
        
        if (vector::length(&submission.approvers) >= required_approvals) {
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
                
                // Reputation boost
                profile.reputation = if (profile.reputation + 5 > MAX_REPUTATION) MAX_REPUTATION else profile.reputation + 5;
                
                config.approved_submissions = config.approved_submissions + 1;

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
            }
        };
    }

    fun reject_submission_internal(
        submission: &mut TaskSubmission,
        profile: &mut StudentProfile,
        config: &GlobalConfig,
        reason: String
    ) {
        assert!(submission.status == STATUS_PENDING, ESubmissionAlreadyApproved);
        submission.status = STATUS_REJECTED;
        submission.comment = reason;

        // Reputation penalty
        if (profile.reputation > config.penalty_points + MIN_REPUTATION_PENALTY) {
            profile.reputation = profile.reputation - config.penalty_points;
        } else {
            profile.reputation = MIN_REPUTATION_PENALTY;
        };

        event::emit(SubmissionRejected {
            submission_id: object::id(submission),
            task_id: submission.task_id,
            student_id: submission.student_id,
            reason
        });
    }

    // === Admin Management Functions ===

    public fun add_skill(
        _: &AdminCap,
        config: &mut GlobalConfig,
        skill: String
    ) {
        vector::push_back(&mut config.skills, skill);
    }

    public fun remove_skill(
        _: &AdminCap,
        config: &mut GlobalConfig,
        index: u64
    ) {
        vector::remove(&mut config.skills, index);
    }

    public fun update_penalty(
        _: &AdminCap,
        config: &mut GlobalConfig,
        new_penalty: u64
    ) {
        config.penalty_points = new_penalty;
    }

    public fun issue_sub_admin(
        _: &AdminCap,
        domain: String,
        recipient: address,
        ctx: &mut TxContext
    ) {
        transfer::transfer(SubAdminCap {
            id: object::new(ctx),
            domain
        }, recipient);
    }

    // === Verifier Evidence Request ===

    public fun request_evidence(
        cap: &VerifierCap,
        submission: &mut TaskSubmission,
        message: String,
        clock: &Clock
    ) {
        check_verifier_expiry(cap, clock);
        vector::push_back(&mut submission.evidence_requests, message);
    }

    // === Getters ===

    public fun total_points(profile: &StudentProfile): u64 {
        profile.total_points
    }

    public fun contribution_count(profile: &StudentProfile): u64 {
        vector::length(&profile.contributions)
    }
}
