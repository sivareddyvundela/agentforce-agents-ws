/**
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 * Class Name      : ProviderInquiryAction
 * Author          : V Karthikeya Iswaryan Lolla
 * Created Date    : Jun 26, 2026
 * Last Modified By: V Karthikeya Iswaryan Lolla
 * Last Modified On: Jun 26, 2026
 * Description     : This class implements for Provider Network Agent
 *  
 * Change History  :
 *  Date          │   Author     │   Change
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 *  Jun 26, 2026  │  V Karthikeya Iswaryan Lolla  │ Initial version
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 */

public class ProviderInquiryAction {

    /**
     * Request Wrapper
     */
    public class InquiryInput {

        @InvocableVariable(
            label='Healthcare Provider Id'
            description='Healthcare Provider Id'
            required=true
        )
        public String healthcareProviderId;
    }

    /**
     * Response Wrapper
     */
    public class InquiryResult {

        @InvocableVariable(label='Success')
        public Boolean success;

        @InvocableVariable(label='Healthcare Provider Id')
        public String healthcareProviderId;

        @InvocableVariable(label='Message')
        public String message;

        @InvocableVariable(label='Inquiry Summary')
        public String inquirySummary;
    }

    @InvocableMethod(
        label='HealthBridge Provider Inquiry Service'
        description='Returns provider information, credentialing status, contracts, payer networks and fee schedules.'
        category='Provider Inquiry Services'
    )
    public static List<InquiryResult> getProviderInformation(List<InquiryInput> inputs) {

        List<InquiryResult> results = new List<InquiryResult>();

        if (inputs == null || inputs.isEmpty()) {
            InquiryResult result = new InquiryResult();
            result.success = false;
            result.message = 'No request details provided';
            results.add(result);
            return results;
        }

        Set<Id> providerIds = new Set<Id>();

        for (InquiryInput input : inputs) {
            if (String.isBlank(input.healthcareProviderId)) {
                InquiryResult result = new InquiryResult();
                result.success = false;
                result.message = 'Healthcare Provider Id is missing';
                results.add(result);
                continue;
            }

            try {
                providerIds.add((Id) input.healthcareProviderId.trim());
            } catch (Exception ex) {
                InquiryResult result = new InquiryResult();
                result.success = false;
                result.message = 'Invalid Healthcare Provider Id : ' + input.healthcareProviderId;
                results.add(result);
            }
        }

        if (providerIds.isEmpty()) {
            return results;
        }

        Map<Id, SObject> providerMap = queryProviders(providerIds);
        Map<Id, List<SObject>> credentialMap = queryCredentials(providerIds);
        Map<Id, List<SObject>> providerContractMap = new Map<Id, List<SObject>>();
        Set<Id> contractIds = new Set<Id>();
        queryProviderContracts(providerIds, providerContractMap, contractIds);
        Map<Id, List<SObject>> feeScheduleMap = queryFeeSchedules(contractIds);

        for (Id providerId : providerIds) {
            InquiryResult result = new InquiryResult();
            result.healthcareProviderId = providerId;

            if (!providerMap.containsKey(providerId)) {
                result.success = false;
                result.message = 'Healthcare Provider not found';
                results.add(result);
                continue;
            }

            Map<String, Object> response = new Map<String, Object>();
            response.put('Provider', providerMap.get(providerId));
            response.put('Credentials', credentialMap.get(providerId));

            List<Map<String, Object>> contractDetails = new List<Map<String, Object>>();
            if (providerContractMap.containsKey(providerId)) {
                for (SObject pnc : providerContractMap.get(providerId)) {
                    Map<String, Object> contractInfo = new Map<String, Object>();
                    contractInfo.put('ProviderNetworkContract', pnc);
                    Id contractId = (Id) pnc.get('ContractId');
                    contractInfo.put('FeeSchedules', feeScheduleMap.get(contractId));
                    contractDetails.add(contractInfo);
                }
            }

            response.put('Contracts', contractDetails);
            result.success = true;
            result.message = 'Provider information retrieved successfully';
            result.inquirySummary = JSON.serializePretty(response);
            results.add(result);
        }

        return results;
    }

    private static Map<Id, SObject> queryProviders(Set<Id> providerIds) {
        Map<Id, SObject> providerMap = new Map<Id, SObject>();
        String providerObjectName = resolveProviderObjectApiName();
        
        if (String.isBlank(providerObjectName)) {
            return providerMap;
        }

        if (providerObjectName == 'HealthcareProvider') {
            List<HealthcareProvider> providers = [
                SELECT Id, Name, NPI__c, Provider_Phone__c, Email__c, Tax_ID__c
                FROM HealthcareProvider
                WHERE Id IN :providerIds
            ];
            for (HealthcareProvider provider : providers) {
                providerMap.put(provider.Id, provider);
            }
        } else if (providerObjectName == 'Account') {
            List<Account> accounts = [
                SELECT Id, Name, Phone, PersonEmail, Type
                FROM Account
                WHERE Id IN :providerIds
            ];
            for (Account account : accounts) {
                providerMap.put(account.Id, account);
            }
        }
        
        return providerMap;
    }

    private static Map<Id, List<SObject>> queryCredentials(Set<Id> providerIds) {
        Map<Id, List<SObject>> credentialMap = new Map<Id, List<SObject>>();
        if (!objectExists('Credential__c') || !fieldExists('Credential__c', 'Healthcare_Provider__c')) {
            return credentialMap;
        }

        String soql = 'SELECT Id, Name, Credentialing_Status__c, Application_Date__c, Assigned_Analyst__c, Current_Stage__c, Expected_Completion__c, Healthcare_Provider__c FROM Credential__c WHERE Healthcare_Provider__c IN :providerIds';
        for (SObject credential : Database.query(soql)) {
            Id providerId = (Id) credential.get('Healthcare_Provider__c');
            if (!credentialMap.containsKey(providerId)) {
                credentialMap.put(providerId, new List<SObject>());
            }
            credentialMap.get(providerId).add(credential);
        }
        return credentialMap;
    }

    private static void queryProviderContracts(
        Set<Id> providerIds,
        Map<Id, List<SObject>> providerContractMap,
        Set<Id> contractIds
    ) {
        if (!objectExists('ProviderNetworkContract')) {
            return;
        }

        String soql = 'SELECT Id, HealthcareProviderId, ContractId FROM ProviderNetworkContract WHERE HealthcareProviderId IN :providerIds';
        for (SObject pnc : Database.query(soql)) {
            Id providerId = (Id) pnc.get('HealthcareProviderId');
            if (!providerContractMap.containsKey(providerId)) {
                providerContractMap.put(providerId, new List<SObject>());
            }
            providerContractMap.get(providerId).add(pnc);

            Id contractId = (Id) pnc.get('ContractId');
            if (contractId != null) {
                contractIds.add(contractId);
            }
        }
    }

    private static Map<Id, List<SObject>> queryFeeSchedules(Set<Id> contractIds) {
        Map<Id, List<SObject>> feeScheduleMap = new Map<Id, List<SObject>>();
        if (contractIds.isEmpty() || !objectExists('Fee_Schedule__c') || !fieldExists('Fee_Schedule__c', 'Contract__c')) {
            return feeScheduleMap;
        }

        String soql = 'SELECT Id, Name, Allowed_Amount__c, CPT_Code__c, Description__c, Contract__c FROM Fee_Schedule__c WHERE Contract__c IN :contractIds';
        for (SObject fee : Database.query(soql)) {
            Id contractId = (Id) fee.get('Contract__c');
            if (!feeScheduleMap.containsKey(contractId)) {
                feeScheduleMap.put(contractId, new List<SObject>());
            }
            feeScheduleMap.get(contractId).add(fee);
        }
        return feeScheduleMap;
    }

    private static String resolveProviderObjectApiName() {
        for (String objectName : new List<String>{ 'HealthcareProvider', 'Account' }) {
            if (Schema.getGlobalDescribe().containsKey(objectName)) {
                return objectName;
            }
        }
        return null;
    }

    private static Boolean objectExists(String objectApiName) {
        return String.isNotBlank(objectApiName) && Schema.getGlobalDescribe().containsKey(objectApiName);
    }

    private static Boolean fieldExists(String objectApiName, String fieldApiName) {
        if (String.isBlank(objectApiName) || String.isBlank(fieldApiName)) {
            return false;
        }
        Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objectApiName);
        if (objectType == null) {
            return false;
        }
        return objectType.getDescribe().fields.getMap().containsKey(fieldApiName);
    }
}