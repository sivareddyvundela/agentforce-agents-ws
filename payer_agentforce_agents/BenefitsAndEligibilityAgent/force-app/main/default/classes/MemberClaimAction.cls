public with sharing class MemberClaimAction {
    private static final String CASE_SUBJECT = 'Claim Operations';
    private static final Integer CASE_DESCRIPTION_MAX_LENGTH = 32000;

    public class ClaimInput {
        @InvocableVariable(label='Member Id' description='The Member Id of the member whose claims should be retrieved' required=true)
        public String memberId;
    }

    public class ClaimResult {
        @InvocableVariable(label='Success')
        public Boolean success;

        @InvocableVariable(label='Member Id')
        public String memberId;

        @InvocableVariable(label='Return Message')
        public String message;

        @InvocableVariable(label='Claim Summary')
        public String claimSummary;
    }

    @InvocableMethod(label='Healthbridge Member Claims' description='Retrieves a member\'s claims and explains denial reasons.' category='Member Services')
    public static List<ClaimResult> getMemberClaims(List<ClaimInput> inputs) {
        // Initialize the results list.
        List<ClaimResult> results = new List<ClaimResult>();
        // Check-1: Check if the input is null or empty.
        if (inputs == null || inputs.isEmpty()) {
            ClaimResult errorResult = new ClaimResult();
            errorResult.success = false;
            errorResult.message = 'No request details provided';
            results.add(errorResult);
            return results;
        }

        // Check-2: Collect Member IDs from input requests 
        Set<Id> memberIds = new Set<Id>();
        for (ClaimInput input : inputs) {
            // Check-2a: Verify Details from each Request and filtering those requests has all details to proceed on member verification
            if (String.isBlank(input.memberId)) {
                ClaimResult errorResult = new ClaimResult();
                errorResult.success = false;
                errorResult.message = 'memberId is missing in the request';
                results.add(errorResult);
                continue;
            }
            try {
                memberIds.add((Id) input.memberId.trim());
            } catch (Exception e) {
                ClaimResult errorResult = new ClaimResult();
                errorResult.success = false;
                errorResult.message = 'Invalid memberId: ' + input.memberId;
                results.add(errorResult);
                continue;
            }
        }

        // Check-3 Querying Claim & Claim Items details for memberIds
        List<Claim> claimList = [SELECT
                    Id,
                    Name,
                    AccountId,
                    Status,
                    ClaimLossDate,
                    EstimatedAmount,
                    ApprovedAmount,
                    ActualAmount,
                    Claim_External_ID__c,
                    Date_Submitted__c,
                    Denial_Reason__c,
                    Member_Responsibility__c,
                    Provider_Name__c,
                    Service_Type__c,
                    CPT_Codes__c,
                    CPT_Descriptions__c,
                    Diagnosis_Codes__c,
                    ERA_Number__c,
                    Submitting_Provider__c,
                    Submitting_Provider__r.Name,
                    Submitting_Provider__r.Credentials__c,
                    Submitting_Provider__r.Group_Name__c,
                    Submitting_Provider__r.Network_Status__c,
                    Submitting_Provider__r.Provider_Phone__c,
                    (
                        SELECT
                            Id,
                            Name,
                            ClaimId,
                            Description,
                            Category,
                            InsurancePolicyCoverageId,
                            ClaimParticipantId,
                            InsurancePolicyAssetId
                        FROM ClaimItems
                    )
                FROM Claim
                WHERE AccountId IN :memberIds];
    
        // returning result
         // Load the context for the member IDs.
        ClaimResult result = new ClaimResult();
        result.success = true;
        result.message = 'Extracted Claims  successfully';
        result.claimSummary = String.valueOf(claimList);
        results.add(result);

        return results;
    }
}