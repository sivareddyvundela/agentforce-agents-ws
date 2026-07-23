public with sharing class MemberInquiryAction {

    /**
     * Following class is request wrapper for Invocable method
     */
    public class InquiryInput {
        @InvocableVariable(label='Member ID' description='Salesforce Account ID returned by the member verification action' required=true)
        public String memberId;
    }

    /**
     * Following class is response wrapper for Invocable method
     */
    public class InquiryResult {
        @InvocableVariable(label='Success')
        public Boolean success;

        @InvocableVariable(label='Member ID')
        public String memberId;

        @InvocableVariable(label='Message')
        public String message;

        @InvocableVariable(label='Inquiry Summary')
        public String inquirySummary;
    }

    /**
     * Following method is exposed as an @InvocableMethod to return member benefits, plan coverage, prior authorization requirements, submitted PA * status, or a history-based PA turnaround prediction.
     */
    @InvocableMethod( label='HealthBridge Member Inquiry Service' description='Returns member benefits, plan coverage, PA requirements, submitted PA status, or a history-based PA turnaround prediction.' category='Member Inquiry Services')
    public static List<InquiryResult> getInquiryInformation(List<InquiryInput> inputs) {
        // Initialize the results list.
        List<InquiryResult> results = new List<InquiryResult>();
        // Check-1: Check if the input is null or empty.
        if (inputs == null || inputs.isEmpty()) {
            InquiryResult errorResult = new InquiryResult();
            errorResult.success = false;
            errorResult.message = 'No request details provided';
            results.add(errorResult);
            return results;
        }

        // Check-2: Collect Member IDs from input requests 
        Set<Id> memberIds = new Set<Id>();
        for (InquiryInput input : inputs) {
            // Check-2a: Verify Details from each Request and filtering those requests has all details to proceed on member verification
            if (String.isBlank(input.memberId)) {
                InquiryResult errorResult = new InquiryResult();
                errorResult.success = false;
                errorResult.message = 'memberId is missing in the request';
                results.add(errorResult);
                continue;
            }
            try {
                memberIds.add((Id) input.memberId.trim());
            } catch (Exception e) {
                InquiryResult errorResult = new InquiryResult();
                errorResult.success = false;
                errorResult.message = 'Invalid memberId: ' + input.memberId;
                results.add(errorResult);
                continue;
            }
        }

        // Check-3: Extract EOB, planDetails, Prior Authorization requests, claims data etc from requested member data.
        // query to pull all plan benefits
        List<PlanBenefit> planBenefitList = [
            SELECT
                Id,
                Name,
                PurchaserPlanId,
                Status,
                EffectiveFrom,
                EffectiveTo,
                PrimaryCareCopay,
                SpecialistCopay,
                EmergencyDepartmentCopay,
                UrgentCareCopay,
                IndividualInNetworkDeductible,
                IndividualOutofNetworkDeductible,
                FamilyInNetworkDeductible,
                FamilyOutofNetworkDeductible,
                InNetworkCoinsurancePercentage,
                OutofNetworkCoinsurancePercentage,
                IndividualInNetworkOutofPocket,
                IndividualOutofNetworkOutofPocket,
                FamilyInNetworkOutofPocket,
                FamilyOutofNetworkOutofPocket,
                BenefitNotes,
                (
                    SELECT
                        Id,
                        Name,
                        PlanBenefitId,
                        BenefitCategory,
                        ServiceType,
                        Notes,
                        IsInPlanNetwork,
                        InNetworkCoverage
                    FROM PlanBenefitItems
                    LIMIT 200
                )
            FROM PlanBenefit
            WHERE PurchaserPlanId IN (
                SELECT PlanId
                FROM MemberPlan
                WHERE MemberId IN :memberIds
            )
            LIMIT 200
        ];

        // Load the context for the member IDs.
        InquiryResult result = new InquiryResult();
        result.success = true;
        result.message = 'Extracted Plan Benefits successfully';
        result.inquirySummary = String.valueOf(planBenefitList);
        results.add(result);

        return results;
    }
}