import { useState, useMemo } from "react";
import { 
  useSuiClient, 
  useSuiClientQuery, 
  useSignAndExecuteTransaction, 
  useCurrentAccount,
  ConnectButton
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { 
  LayoutDashboard, 
  PlusCircle, 
  ShieldCheck, 
  Wallet,
  Loader2,
  Sparkles,
  Crown,
  ClipboardList,
  CheckCircle,
  Settings,
  RefreshCw,
  X
} from "lucide-react";

import { ADMIN_ADDRESS, ADMIN_CAP_ID, GLOBAL_CONFIG_ID, PACKAGE_ID, UPGRADED_PACKAGE_ID, MODULE_NAME, CLOCK_ID } from "./constants";
import { ProfileCard } from "./components/ProfileCard";
import { ContributionList } from "./components/ContributionList";
import { CreateProfileModal } from "./components/CreateProfileModal";
import { VerifyContributionForm } from "./components/VerifyContributionForm";
import { TaskBoard } from "./components/TaskBoard";
import { CreateTaskForm } from "./components/CreateTaskForm";
import { SubmissionList } from "./components/SubmissionList";
import { SubmitTaskModal } from "./components/SubmitTaskModal";
import { PurchaseVerifier } from "./components/PurchaseVerifier";
import { VerifierManagement } from "./components/VerifierManagement";
import { Dashboard } from "./components/Dashboard";
import { MyWorkspace } from "./components/MyWorkspace";
import { ClaimPortal } from "./components/ClaimPortal";
import { NotificationCenter } from "./components/NotificationCenter";
import { UserProfileView } from "./components/UserProfileView";

export default function App() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecute, mutateAsync: signAndExecuteAsync } = useSignAndExecuteTransaction();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "tasks" | "workspace" | "rewards" | "verifier" | "admin">("profile");
  const [isBusy, setIsBusy] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  // Query ProfileCreated events to find the user's shared profile
  const { data: profileEvents, refetch: refetchProfileEvents, isLoading: isEventsLoading } = useSuiClientQuery(
    "queryEvents",
    {
      query: { MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ProfileCreated` },
    }
  );

  const profileId = useMemo(() => {
    if (!profileEvents || !account) return null;
    const event = profileEvents.data.find((e) => (e.parsedJson as any).owner === account.address);
    return event ? (event.parsedJson as any).profile_id : null;
  }, [profileEvents, account]);

  // Fetch the actual shared StudentProfile object
  const { data: profileObject, refetch: refetchProfile, isLoading: isProfileLoading } = useSuiClientQuery(
    "getObject",
    {
      id: profileId!,
      options: { showContent: true },
    },
    { enabled: !!profileId }
  );
  
  const isObjectsLoading = isEventsLoading || (!!profileId && isProfileLoading);

  // Query verifier caps
  const { data: verifierCaps, refetch: refetchVerifierCaps } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::VerifierCap` },
      options: { showContent: true },
    },
    { enabled: !!account }
  );

  // Query admin cap
  const { data: adminCaps, refetch: refetchAdminCaps } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::AdminCap` },
      options: { showContent: true },
    },
    { enabled: !!account }
  );

  console.log("Admin Cap Query Result:", adminCaps);
  console.log("Looking for AdminCap:", `${PACKAGE_ID}::${MODULE_NAME}::AdminCap`);
  console.log("Current PACKAGE_ID:", PACKAGE_ID);

  // Query for TaskCreated events to get all quest IDs
  const { data: taskEvents, refetch: refetchEvents } = useSuiClientQuery(
    "queryEvents",
    { query: { MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::TaskCreated` } }
  );

  const taskIds = useMemo(() => {
    return taskEvents?.data?.map((e) => (e.parsedJson as any).task_id) || [];
  }, [taskEvents]);

  // Fetch task objects directly by ID
  const { data: taskObjects, refetch: refetchTasks } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: taskIds,
      options: { showContent: true },
    },
    { enabled: taskIds.length > 0 }
  );

  console.log("Task Events Data:", taskEvents?.data);
  console.log("Extracted Task IDs:", taskIds);
  console.log("Task Objects Data:", taskObjects);
  
  const { data: submissionEvents, refetch: refetchSubmissionEvents } = useSuiClientQuery(
    "queryEvents",
    { query: { MoveEventType: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::TaskSubmitted` } }
  );

  const submissionIds = useMemo(() => {
    return submissionEvents?.data?.map((e) => (e.parsedJson as any).submission_id) || [];
  }, [submissionEvents]);

  // Query for GlobalConfig directly by ID since it's a shared object
  const { data: globalConfigObject } = useSuiClientQuery(
    "getObject",
    {
      id: GLOBAL_CONFIG_ID,
      options: { showContent: true },
    },
    { enabled: !!GLOBAL_CONFIG_ID }
  );

  const globalConfigId = GLOBAL_CONFIG_ID;

  const globalConfig = useMemo(() => {
    const obj = globalConfigObject?.data;
    if (!obj || !obj.content || obj.content.dataType !== "moveObject") return null;
    const fields = obj.content.fields as any;
    return {
      id: obj.objectId,
      skills: fields.skills,
      totalTasks: Number(fields.total_tasks),
      totalSubmissions: Number(fields.total_submissions),
      approvedSubmissions: Number(fields.approved_submissions),
    };
  }, [globalConfigObject]);

  // Query for TaskSubmission objects directly by ID
  const { data: submissionObjects, refetch: refetchSubmissions } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: submissionIds,
      options: { showContent: true },
    },
    { enabled: submissionIds.length > 0 }
  );

  console.log("Submission Events Data:", submissionEvents?.data);
  console.log("Extracted Submission IDs:", submissionIds);
  console.log("Submission Objects Data:", submissionObjects);

  const profile = useMemo(() => {
    const obj = profileObject?.data;
    if (!obj || !obj.content || obj.content.dataType !== "moveObject") return null;
    
    const fields = obj.content.fields as any;
    return {
      id: obj.objectId,
      name: fields.name,
      student_id: fields.student_id,
      university: fields.university,
      total_points: fields.total_points,
      reputation: Number(fields.reputation),
      badges: fields.badges,
      contributions: fields.contributions.map((c: any) => ({
        title: c.fields.title,
        description: c.fields.description,
        category: c.fields.category,
        points: c.fields.points,
        timestamp: c.fields.timestamp,
        verified_by: c.fields.verified_by,
      })),
    };
  }, [profileObject]);

  const tasks = useMemo(() => {
    const rawObjects = taskObjects || [];
    
    return rawObjects
      .filter((obj) => obj.data && obj.data.content && obj.data.content.dataType === "moveObject")
      .map((obj: any) => {
        const fields = obj.data.content.fields;
        return {
          id: obj.data.objectId,
          title: fields.title,
          description: fields.description,
          category: fields.category,
          points: fields.points,
          creator: fields.creator,
          isActive: fields.is_active,
          rubric: fields.rubric,
          minReputation: Number(fields.min_reputation),
          requiresDoubleCheck: fields.requires_double_check,
          deadline: fields.deadline,
          isCompetition: fields.is_competition,
          votingDeadline: fields.voting_deadline,
          topSubmission: fields.top_submission?.fields?.contents || fields.top_submission,
          maxVotes: fields.max_votes,
          winnerClaimed: fields.winner_claimed,
        };
      });
  }, [taskObjects]);

  const submissions = useMemo(() => {
    const rawObjects = submissionObjects || [];
    return rawObjects
      .filter((obj) => obj.data && obj.data.content && obj.data.content.dataType === "moveObject")
      .map((obj: any) => {
        const fields = obj.data.content.fields;
        const task = tasks.find(t => t.id === fields.task_id);
        return {
          id: obj.data.objectId,
          taskId: fields.task_id,
          studentId: fields.student_id,
          studentAddress: fields.student_address,
          proofUrl: fields.proof_url,
          status: fields.status,
          comment: fields.comment,
          taskTitle: task?.title,
          approvers: fields.approvers,
          requiresDoubleCheck: task?.requiresDoubleCheck,
          rubric: task?.rubric,
          submittedAt: Number(fields.submitted_at),
          voteCount: Number(fields.vote_count || 0)
        };
      });
  }, [submissionObjects, tasks]);

  const verifierInfo = useMemo(() => {
    const obj = verifierCaps?.data?.[0]?.data;
    if (!obj || !obj.content || obj.content.dataType !== "moveObject") return null;
    const fields = obj.content.fields as any;
    return {
      id: obj.objectId,
      orgName: fields.org_name,
      expiresAt: Number(fields.expires_at)
    };
  }, [verifierCaps]);

  const hasVerifierCap = !!verifierInfo;
  const isVerifierExpired = useMemo(() => {
    if (!verifierInfo) return false;
    return Date.now() > verifierInfo.expiresAt;
  }, [verifierInfo]);

  const isAdminAddress = useMemo(() => account?.address === ADMIN_ADDRESS, [account]);
  const adminCapId = useMemo(() => {
    return adminCaps?.data?.[0]?.data?.objectId || (isAdminAddress ? ADMIN_CAP_ID : undefined);
  }, [adminCaps, isAdminAddress]);
  const hasAdminCap = useMemo(() => {
    const fromCap = (adminCaps?.data?.length || 0) > 0;
    return fromCap || isAdminAddress;
  }, [adminCaps, isAdminAddress]);

  const handleCreateProfile = async (data: { name: string; studentId: string; university: string }) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::create_profile`,
      arguments: [
        tx.pure.string(data.name),
        tx.pure.string(data.studentId),
        tx.pure.string(data.university),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      setTimeout(() => {
        refetchProfileEvents();
        if (profileId) refetchProfile();
      }, 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Failed to create profile: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  const handleCreateTask = async (data: any) => {
    const verifierCapId = verifierCaps?.data?.[0]?.data?.objectId;
    
    if (!adminCapId && !verifierCapId) {
      alert("Error: You do not have an AdminCap or VerifierCap object. You must be an authorized organization to post quests.");
      return;
    }

    if (!globalConfigId) {
      alert("Error: GLOBAL_CONFIG_ID is missing. Please set it in your environment variables.");
      return;
    }

    const tx = new Transaction();
    
    if (adminCapId) {
      tx.moveCall({
        target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::admin_create_task`,
        arguments: [
          tx.object(adminCapId),
          tx.object(globalConfigId),
          tx.pure.string(data.title),
          tx.pure.string(data.description),
          tx.pure.string(data.category),
          tx.pure.u64(data.points.toString()),
          tx.pure.vector("string", data.rubric || []),
          tx.pure.u64((data.minReputation || 0).toString()),
          tx.pure.bool(!!data.requiresDoubleCheck),
          tx.pure.u64(data.deadline.toString()),
          tx.pure.bool(!!data.isCompetition),
          tx.pure.u64((data.votingDeadline || 0).toString()),
        ],
      });
    } else if (verifierCapId) {
      tx.moveCall({
        target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::create_task`,
        arguments: [
          tx.object(verifierCapId),
          tx.object(globalConfigId),
          tx.pure.string(data.title),
          tx.pure.string(data.description),
          tx.pure.string(data.category),
          tx.pure.u64(data.points.toString()),
          tx.pure.vector("string", data.rubric || []),
          tx.pure.u64((data.minReputation || 0).toString()),
          tx.pure.bool(!!data.requiresDoubleCheck),
          tx.pure.u64(data.deadline.toString()),
          tx.pure.bool(!!data.isCompetition),
          tx.pure.u64((data.votingDeadline || 0).toString()),
          tx.object(CLOCK_ID),
        ],
      });
    }

    try {
      const result = await signAndExecuteAsync({ transaction: tx });
      console.log("Task created successfully:", result);
      alert("Quest posted successfully! Digest: " + result.digest);
      setTimeout(() => {
        refetchTasks();
        refetchEvents();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to create task:", error);
      alert("Failed to create task: " + (error.message || "Unknown error"));
      throw error; // Re-throw so the form component knows it failed
    }
  };

  const handleUpdateTask = async (task: any) => {
    if (!adminCapId) {
      alert("Admin capability required.");
      return;
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::admin_update_task`,
      arguments: [
        tx.object(adminCapId),
        tx.object(task.id),
        tx.pure.string(task.title),
        tx.pure.string(task.description),
        tx.pure.string(task.category),
        tx.pure.u64(task.points.toString()),
        tx.pure.bool(task.isActive),
        tx.pure.vector("string", task.rubric || []),
        tx.pure.u64((task.minReputation || 0).toString()),
        tx.pure.bool(!!task.requiresDoubleCheck),
        tx.pure.u64(task.deadline.toString()),
        tx.pure.bool(!!task.isCompetition),
        tx.pure.u64((task.votingDeadline || 0).toString()),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Quest updated successfully.");
      setTimeout(() => {
        refetchTasks();
        refetchEvents();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to update task:", error);
      alert("Failed to update quest: " + (error.message || "Unknown error"));
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!adminCapId) {
      alert("Admin capability required.");
      return;
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::admin_delete_task`,
      arguments: [
        tx.object(adminCapId),
        tx.object(taskId),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Quest deleted successfully.");
      setTimeout(() => {
        refetchTasks();
        refetchEvents();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete quest: " + (error.message || "Unknown error"));
      throw error;
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) setSelectedTask({ id: task.id, title: task.title });
  };

  const handleSubmitTask = async (proofUrl: string) => {
    if (!profile || !selectedTask) return;
    if (!globalConfigId) {
      alert("Error: GLOBAL_CONFIG_ID is missing. Please set it in your environment variables.");
      return;
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::submit_task`,
      arguments: [
        tx.object(profile.id),
        tx.object(selectedTask.id),
        tx.object(globalConfigId),
        tx.pure.string(proofUrl),
        tx.object(CLOCK_ID),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Submission successful! Waiting for review.");
      setTimeout(() => refetchSubmissionEvents(), 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Submission failed: ${error.message}`);
    }
  };

  const handleVoteSubmission = async (taskId: string, submissionId: string) => {
    if (!profile) return;
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::vote_submission`,
      arguments: [
        tx.object(profile.id),
        tx.object(taskId),
        tx.object(submissionId),
        tx.object(CLOCK_ID),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Vote cast successfully!");
      setTimeout(() => {
        refetchSubmissions();
        refetchTasks();
      }, 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Voting failed: ${error.message}`);
    }
  };

  const handleCommunityFinalize = async (submissionId: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub || !globalConfigId) return;
    
    const studentProfileId = sub.studentId;

    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::community_finalize`,
      arguments: [
        tx.object(submissionId),
        tx.object(studentProfileId),
        tx.object(sub.taskId),
        tx.object(globalConfigId),
        tx.object(CLOCK_ID),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Submission finalized by community!");
      setTimeout(() => {
        refetchSubmissions();
        refetchProfile();
      }, 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Finalization failed: ${error.message}`);
    }
  };

  const handleClaimCuratorReward = async (submissionId: string) => {
    if (!profile) return;
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::claim_curator_reward`,
      arguments: [
        tx.object(profile.id),
        tx.object(submissionId),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Curator reward (+5 XP) claimed successfully!");
      setTimeout(() => refetchProfile(), 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Claim failed: ${error.message}`);
    }
  };

  const handleClaimWinner = async (taskId: string, submissionId: string) => {
    if (!profile || !globalConfigId) return;

    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::claim_competition_reward`,
      arguments: [
        tx.object(profile.id),
        tx.object(taskId),
        tx.object(submissionId),
        tx.object(globalConfigId),
        tx.object(CLOCK_ID),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Winner reward claimed successfully!");
      setTimeout(() => {
        refetchProfile();
        refetchSubmissions();
        refetchTasks();
      }, 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Claim failed: ${error.message}`);
    }
  };

  const handleApproveSubmission = async (sub: any) => {
    const verifierCapId = verifierCaps?.data?.[0]?.data?.objectId;
    
    if (!adminCapId && !verifierCapId) {
      alert("Permission denied: No capability object found.");
      return;
    }

    if (!globalConfigId) {
      alert("Error: GLOBAL_CONFIG_ID is missing. Please set it in your environment variables.");
      return;
    }

    const tx = new Transaction();
    if (adminCapId) {
      tx.moveCall({
        target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::admin_approve_submission`,
        arguments: [
          tx.object(adminCapId),
          tx.object(sub.id),
          tx.object(sub.studentId),
          tx.object(sub.taskId),
          tx.object(globalConfigId),
          tx.object(CLOCK_ID),
        ],
      });
    } else if (verifierCapId) {
      tx.moveCall({
        target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::verifier_approve_submission`,
        arguments: [
          tx.object(verifierCapId),
          tx.object(sub.id),
          tx.object(sub.studentId),
          tx.object(sub.taskId),
          tx.object(globalConfigId),
          tx.object(CLOCK_ID),
        ],
      });
    }

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Submission approved!");
      setTimeout(() => {
        refetchSubmissions();
        refetchProfile();
      }, 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Approval failed: ${error.message}`);
    }
  };

  const handleRejectSubmission = async (submissionId: string, reason: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    const verifierCapId = verifierCaps?.data?.[0]?.data?.objectId;
    
    if (!adminCapId && !verifierCapId) return;

    if (!globalConfigId) {
      alert("Error: GLOBAL_CONFIG_ID is missing. Please set it in your environment variables.");
      return;
    }

    const tx = new Transaction();
    if (adminCapId) {
      tx.moveCall({
        target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::admin_reject_submission`,
        arguments: [
          tx.object(adminCapId),
          tx.object(submissionId),
          tx.object(sub?.studentId || ""), // Need student ID for reputation penalty
          tx.object(globalConfigId),
          tx.pure.string(reason),
        ],
      });
    } else if (verifierCapId) {
      tx.moveCall({
        target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::verifier_reject_submission`,
        arguments: [
          tx.object(verifierCapId),
          tx.object(submissionId),
          tx.object(sub?.studentId || ""),
          tx.object(globalConfigId),
          tx.pure.string(reason),
          tx.object(CLOCK_ID),
        ],
      });
    }

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Submission rejected.");
      setTimeout(() => refetchSubmissions(), 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Rejection failed: ${error.message}`);
    }
  };

  const handleApproveTask = async (data: any) => {
    const verifierCapId = verifierCaps?.data?.[0]?.data?.objectId;
    
    const tx = new Transaction();
    
    if (adminCapId) {
      tx.moveCall({
        target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::admin_complete_task`,
        arguments: [
          tx.object(adminCapId),
          tx.object(data.studentProfileId),
          tx.object(data.taskId),
          tx.object(CLOCK_ID),
        ],
      });
    } else if (verifierCapId) {
      tx.moveCall({
        target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::complete_task`,
        arguments: [
          tx.object(verifierCapId),
          tx.object(data.studentProfileId),
          tx.object(data.taskId),
          tx.object(CLOCK_ID),
        ],
      });
    } else return;

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          alert("Task approved and points awarded!");
          if (profileId) refetchProfile();
        },
      }
    );
  };

  const handlePurchaseVerifier = async (orgName: string) => {
    const tx = new Transaction();
    
    // Use the gas coin directly for payment
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::purchase_verifier_cap`,
      arguments: [
        tx.gas,
        tx.pure.string(orgName),
        tx.object(CLOCK_ID),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Successfully purchased Verifier Package!");
      setTimeout(() => refetchVerifierCaps(), 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Purchase failed: ${error.message}`);
      throw error;
    }
  };

  const handleRenewVerifier = async () => {
    if (!verifierInfo) return;

    const tx = new Transaction();
    // Use the gas coin directly for renewal
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::renew_verifier_cap`,
      arguments: [
        tx.object(verifierInfo.id),
        tx.gas,
        tx.object(CLOCK_ID),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Successfully renewed Verifier Subscription!");
      setTimeout(() => refetchVerifierCaps(), 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Renewal failed: ${error.message}`);
    }
  };

  const handleIssueVerifier = async (data: { orgName: string; recipient: string }) => {
    alert("Manual issuance is deprecated. Use the automated purchase system.");
  };

  const handleUpdateSubmission = async (submissionId: string, newProofUrl: string) => {
    if (!profile) return;
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;

    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::update_submission`,
      arguments: [
        tx.object(profile.id),
        tx.object(submissionId),
        tx.object(submission.taskId),
        tx.pure.string(newProofUrl),
        tx.object(CLOCK_ID),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Submission updated successfully!");
      setTimeout(() => refetchSubmissions(), 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Update failed: ${error.message}`);
    }
  };

  const handleDisputeSubmission = async (submissionId: string, reason: string) => {
    if (!profile) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::dispute_submission`,
      arguments: [
        tx.object(profile.id),
        tx.object(submissionId),
        tx.pure.string(reason),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Dispute submitted. Admin will review shortly.");
      setTimeout(() => refetchSubmissions(), 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Dispute failed: ${error.message}`);
    }
  };

  const handleClaimRewards = async () => {
    if (!profile) return;
    setIsBusy(true);
    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::claim_rewards`,
      arguments: [
        tx.object(profile.id),
      ],
    });

    try {
      await signAndExecuteAsync({ transaction: tx });
      alert("Rewards claimed successfully!");
      setTimeout(() => refetchProfile(), 2000);
    } catch (error: any) {
      console.error(error);
      alert(`Claim failed: ${error.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">POC Protocol</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">Proof of Contribution</p>
              <span className="text-[8px] text-white/20 font-mono bg-white/5 px-1 rounded">v:{PACKAGE_ID.slice(0, 6)}...</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {account && (
            <div className="hidden md:flex bg-white/5 rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === "profile" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === "tasks" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
                }`}
              >
                Quests
              </button>
              <button
                onClick={() => setActiveTab("workspace")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === "workspace" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
                }`}
              >
                My Workspace
              </button>
              <button
                onClick={() => setActiveTab("rewards")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === "rewards" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
                }`}
              >
                Rewards
              </button>
              <button
                onClick={() => setActiveTab("verifier")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === "verifier" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
                }`}
              >
                Organization
              </button>
              {hasAdminCap && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "admin" ? "bg-amber-500/20 text-amber-500 shadow-sm" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  Admin
                </button>
              )}
            </div>
          )}
          <button 
            onClick={() => {
              refetchProfile();
              refetchTasks();
              refetchSubmissions();
              refetchAdminCaps();
              refetchVerifierCaps();
            }}
            className="p-2 text-white/40 hover:text-white/60 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          <NotificationCenter tasks={tasks} submissions={submissions.filter(s => s.studentAddress === account?.address)} />
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12 max-w-5xl">
        {!account ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/10">
              <Wallet size={48} className="text-white/20" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Your Contribution, <br />
              <span className="gradient-text">Verifiable Forever.</span>
            </h2>
            <p className="text-white/40 max-w-md text-lg mb-10 leading-relaxed">
              Connect your Sui wallet to build your verifiable academic and extracurricular portfolio.
            </p>
            <ConnectButton />
          </div>
        ) : isObjectsLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : viewingStudentId ? (
          <UserProfileView studentId={viewingStudentId} onBack={() => setViewingStudentId(null)} />
        ) : activeTab === "admin" ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Crown className="text-amber-500" size={20} />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Super Admin Dashboard</h2>
              </div>

              <div className="grid gap-6">
                <Dashboard 
                  stats={{
                    totalTasks: globalConfig?.totalTasks || 0,
                    totalSubmissions: globalConfig?.totalSubmissions || 0,
                    approvedSubmissions: globalConfig?.approvedSubmissions || 0,
                    totalUsers: profileEvents?.data?.length || 0
                  }}
                  recentActivity={submissionEvents?.data?.slice(0, 5).map(e => ({
                    type: 'submit',
                    message: `New submission from ${e.parsedJson && (e.parsedJson as any).student_address.slice(0, 6)}...`,
                    time: new Date(e.timestampMs ? Number(e.timestampMs) : Date.now()).toLocaleTimeString()
                  })) || []}
                />
              </div>
            </div>

            <TaskBoard
              tasks={tasks}
              onComplete={handleCompleteTask}
              isVerifier={true}
              isAdmin={hasAdminCap}
              title="Admin Quest Management"
              subtitle="Edit quest content, toggle active status, or delete quests from the protocol."
              onEdit={handleUpdateTask}
              onDelete={handleDeleteTask}
            />

            <CreateTaskForm onSubmit={handleCreateTask} />

            <SubmissionList 
              submissions={submissions} 
              onApprove={handleApproveSubmission}
              onReject={handleRejectSubmission}
              onViewProfile={setViewingStudentId}
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                  <CheckCircle className="text-green-500" />
                  Quick Approve Quest
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/40 uppercase ml-1">Student Profile ID</label>
                      <input id="admin-approve-profile-id" className="input-field w-full text-xs" placeholder="0x..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/40 uppercase ml-1">Quest ID</label>
                      <input id="admin-approve-task-id" className="input-field w-full text-xs" placeholder="0x..." />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const pId = (document.getElementById('admin-approve-profile-id') as HTMLInputElement).value;
                      const tId = (document.getElementById('admin-approve-task-id') as HTMLInputElement).value;
                      if (pId && tId) handleApproveTask({ studentProfileId: pId, taskId: tId });
                    }}
                    className="btn-primary w-full justify-center bg-amber-500/20 text-amber-500 border border-amber-500/20 hover:bg-amber-500/30"
                  >
                    Admin Approval & Award
                  </button>
                </div>
              </div>

              <div className="glass-card">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                  <Settings className="text-primary" />
                  Policy & Skills
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {globalConfig?.skills?.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-bold text-white/60 flex items-center gap-2">
                        {skill}
                        <button className="text-white/20 hover:text-red-500"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input id="new-skill-input" className="input-field flex-1 text-xs" placeholder="Add new skill tag..." />
                    <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-xs font-bold border border-primary/20">Add</button>
                  </div>
                </div>
              </div>
            </div>
            <hr className="border-white/5 my-12" />
            <VerifierManagement />
          </div>
        ) : activeTab === "verifier" ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {hasVerifierCap ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                      <ShieldCheck className={isVerifierExpired ? "text-red-500" : "text-primary"} />
                      {isVerifierExpired ? "Expired Verifier" : "Verifier Dashboard"}
                    </h2>
                    <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">
                      {isVerifierExpired ? "Subscription Expired" : "Manage your organization quests"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">Subscription Expiry</p>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      isVerifierExpired ? "border-red-500/20 bg-red-500/10 text-red-500" : "border-primary/20 bg-primary/10 text-primary"
                    }`}>
                      {new Date(verifierInfo.expiresAt).toLocaleDateString()} at {new Date(verifierInfo.expiresAt).toLocaleTimeString()}
                    </div>
                    <button 
                      onClick={handleRenewVerifier}
                      className="mt-2 text-[10px] text-primary hover:text-white transition-colors font-bold uppercase tracking-widest underline decoration-primary/30 underline-offset-4"
                    >
                      Renew Now
                    </button>
                  </div>
                </div>
                
                {!isVerifierExpired ? (
                  <>
                    <CreateTaskForm onSubmit={handleCreateTask} />
                    <SubmissionList 
                      submissions={submissions} 
                      onApprove={handleApproveSubmission}
                      onReject={handleRejectSubmission}
                      onCommunityFinalize={handleCommunityFinalize}
                      onViewProfile={setViewingStudentId}
                    />
                  </>
                ) : (
                  <div className="glass-card text-center py-12">
                    <ShieldCheck size={48} className="text-red-500/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Subscription Expired</h3>
                    <p className="text-white/40 max-w-xs mx-auto mb-8">
                      Your verifier capabilities have been suspended. Please renew your subscription to continue managing quests.
                    </p>
                    <button onClick={handleRenewVerifier} className="btn-primary px-8">
                      Renew Subscription (5 SUI)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <PurchaseVerifier onPurchase={handlePurchaseVerifier} priceSui={0.05} />
            )}
          </div>
        ) : activeTab === "workspace" ? (
          <MyWorkspace 
            submissions={submissions.filter(s => s.studentAddress === account?.address)}
            onUpdateSubmission={handleUpdateSubmission}
            onDisputeSubmission={handleDisputeSubmission}
          />
        ) : activeTab === "rewards" ? (
          <ClaimPortal 
            totalPoints={profile?.total_points || 0}
            onClaim={handleClaimRewards}
            isBusy={isBusy}
          />
        ) : activeTab === "tasks" ? (
          <div className="animate-in fade-in duration-500">
            <TaskBoard
              tasks={tasks}
              onComplete={handleCompleteTask}
              isVerifier={hasVerifierCap || hasAdminCap}
              isAdmin={hasAdminCap}
              onEdit={handleUpdateTask}
              onDelete={handleDeleteTask}
              userReputation={profile?.reputation || 0}
              userSkills={profile?.contributions?.map((c: any) => c.category) || []}
              onVote={handleVoteSubmission}
              submissions={submissions}
              onClaimWinner={handleClaimWinner}
              onCommunityFinalize={handleCommunityFinalize}
              onClaimCuratorReward={handleClaimCuratorReward}
              onViewProfile={setViewingStudentId}
            />
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {profile ? (
              <>
                <ProfileCard profile={profile} />
                <ContributionList contributions={profile.contributions} />
              </>
            ) : (
              <div className="glass-card flex flex-col items-center justify-center py-20 text-center border-dashed border-white/20">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <LayoutDashboard size={40} className="text-primary/60" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Profile Found</h3>
                <p className="text-white/40 mb-8 max-w-xs">
                  It looks like you haven't created a POC profile yet. Start building your reputation today.
                </p>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary px-8 py-3"
                >
                  <PlusCircle size={20} />
                  Create My Profile
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-40 grayscale hover:grayscale-0 transition-all cursor-default">
            <Sparkles size={16} />
            <span className="text-sm font-bold uppercase tracking-tighter">ITC POC Protocol</span>
          </div>
          <p className="text-white/20 text-xs">
            Built for Sui Network © 2024 ITC_SoulTrace. All rights reserved.
          </p>
        </div>
      </footer>

      <CreateProfileModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateProfile}
      />

      <SubmitTaskModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onSubmit={handleSubmitTask}
      />
    </div>
  );
}
