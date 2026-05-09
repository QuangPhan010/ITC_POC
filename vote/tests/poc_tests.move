#[test_only]
module poc::poc_tests {
    use sui::test_scenario;
    use sui::clock;
    use std::string;
    use poc::poc::{Self, AdminCap, VerifierCap, StudentProfile, Task, TaskSubmission};

    // === Constants ===
    const ADMIN: address = @0xeec802d4e8e8d86a0258702d31d1932ef17226164dee712d397c5ef41aad0dfe;
    const STUDENT: address = @0x57;
    const ORG: address = @0x086;

    #[test]
    fun test_complete_flow() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        // 1. Initialize the module (Admin gets AdminCap)
        {
            poc::init_for_testing(test_scenario::ctx(scenario));
        };

        // 2. Admin issues VerifierCap to Org
        test_scenario::next_tx(scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
            poc::issue_verifier_cap(
                &admin_cap,
                string::utf8(b"ITC Club"),
                ORG,
                test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, admin_cap);
        };

        // 3. Student creates their profile
        test_scenario::next_tx(scenario, STUDENT);
        {
            poc::create_profile(
                string::utf8(b"Alice"),
                string::utf8(b"S12345"),
                string::utf8(b"Sui University"),
                test_scenario::ctx(scenario)
            );
        };

        // 4. Org verifies a contribution for the student
        test_scenario::next_tx(scenario, ORG);
        {
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            let verifier_cap = test_scenario::take_from_sender<VerifierCap>(scenario);
            let mut profile = test_scenario::take_shared<StudentProfile>(scenario);

            poc::verify_contribution(
                &verifier_cap,
                &mut profile,
                string::utf8(b"Sui Hackathon 2024"),
                string::utf8(b"First Place - DeFi Track"),
                string::utf8(b"Competition"),
                500,
                &clock
            );

            // Verify results
            assert!(poc::total_points(&profile) == 500, 0);
            assert!(poc::contribution_count(&profile) == 1, 1);

            test_scenario::return_to_sender(scenario, verifier_cap);
            test_scenario::return_shared(profile);
            clock::destroy_for_testing(clock);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_multiple_contributions() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        // Setup
        poc::init_for_testing(test_scenario::ctx(scenario));
        test_scenario::next_tx(scenario, ADMIN);
        let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
        poc::issue_verifier_cap(&admin_cap, string::utf8(b"Org1"), ORG, test_scenario::ctx(scenario));
        test_scenario::return_to_sender(scenario, admin_cap);

        test_scenario::next_tx(scenario, STUDENT);
        poc::create_profile(string::utf8(b"Bob"), string::utf8(b"B001"), string::utf8(b"Tech Uni"), test_scenario::ctx(scenario));

        // Add 2 contributions
        test_scenario::next_tx(scenario, ORG);
        {
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));
            let verifier_cap = test_scenario::take_from_sender<VerifierCap>(scenario);
            let mut profile = test_scenario::take_shared<StudentProfile>(scenario);

            poc::verify_contribution(&verifier_cap, &mut profile, string::utf8(b"C1"), string::utf8(b"D1"), string::utf8(b"TypeA"), 100, &clock);
            poc::verify_contribution(&verifier_cap, &mut profile, string::utf8(b"C2"), string::utf8(b"D2"), string::utf8(b"TypeB"), 200, &clock);

            assert!(poc::total_points(&profile) == 300, 2);
            assert!(poc::contribution_count(&profile) == 2, 3);

            test_scenario::return_to_sender(scenario, verifier_cap);
            test_scenario::return_shared(profile);
            clock::destroy_for_testing(clock);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_task_submission_and_approval() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        // 1. Setup
        poc::init_for_testing(test_scenario::ctx(scenario));
        
        // 2. Admin creates a task
        test_scenario::next_tx(scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
            poc::admin_create_task(
                &admin_cap,
                string::utf8(b"Community Task"),
                string::utf8(b"Description"),
                string::utf8(b"Community"),
                100,
                test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, admin_cap);
        };

        // 3. Student creates profile
        test_scenario::next_tx(scenario, STUDENT);
        {
            poc::create_profile(
                string::utf8(b"Alice"),
                string::utf8(b"A001"),
                string::utf8(b"Sui Uni"),
                test_scenario::ctx(scenario)
            );
        };

        // 4. Student submits task
        test_scenario::next_tx(scenario, STUDENT);
        {
            let profile = test_scenario::take_shared<StudentProfile>(scenario);
            let task = test_scenario::take_shared<Task>(scenario);
            
            poc::submit_task(
                &profile,
                &task,
                string::utf8(b"https://proof.com/file"),
                test_scenario::ctx(scenario)
            );

            test_scenario::return_shared(profile);
            test_scenario::return_shared(task);
        };

        // 5. Admin approves submission
        test_scenario::next_tx(scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
            let mut submission = test_scenario::take_shared<TaskSubmission>(scenario);
            let mut profile = test_scenario::take_shared<StudentProfile>(scenario);
            let task = test_scenario::take_shared<Task>(scenario);
            let clock = clock::create_for_testing(test_scenario::ctx(scenario));

            poc::admin_approve_submission(
                &admin_cap,
                &mut submission,
                &mut profile,
                &task,
                &clock
            );

            // Verify results
            assert!(poc::total_points(&profile) == 100, 4);
            assert!(poc::contribution_count(&profile) == 1, 5);

            test_scenario::return_to_sender(scenario, admin_cap);
            test_scenario::return_shared(submission);
            test_scenario::return_shared(profile);
            test_scenario::return_shared(task);
            clock::destroy_for_testing(clock);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_admin_can_update_and_delete_task() {
        let mut scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        poc::init_for_testing(test_scenario::ctx(scenario));

        test_scenario::next_tx(scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
            poc::admin_create_task(
                &admin_cap,
                string::utf8(b"Original Quest"),
                string::utf8(b"Original Description"),
                string::utf8(b"Content"),
                50,
                test_scenario::ctx(scenario)
            );
            test_scenario::return_to_sender(scenario, admin_cap);
        };

        test_scenario::next_tx(scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
            let mut task = test_scenario::take_shared<Task>(scenario);

            poc::admin_update_task(
                &admin_cap,
                &mut task,
                string::utf8(b"Updated Quest"),
                string::utf8(b"Updated Description"),
                string::utf8(b"Workshop"),
                75,
                false
            );

            test_scenario::return_to_sender(scenario, admin_cap);
            test_scenario::return_shared(task);
        };

        test_scenario::next_tx(scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
            let task = test_scenario::take_shared<Task>(scenario);

            poc::admin_delete_task(&admin_cap, task);

            test_scenario::return_to_sender(scenario, admin_cap);
        };

        test_scenario::end(scenario_val);
    }
}
