/**
 * Provides provider verification services for healthcare payer operations.
 * Authenticates providers using name, NPI, and phone number against HealthcareProvider records.
 */
public class ProviderVerificationAction {
    /**
     * Verifies provider identity using provided provider name, NPI, and phone number against HealthcareProvider records.
     *
     * @param requests List of verification requests containing provider credentials
     * @return List of verification results indicating success/failure with details
     */
    @InvocableMethod(
        label='HealthBridge Provider Verification'
        description='Verifies provider identity using name, NPI, and phone number'
        category='Provider Services'
    )
    public static List<VerificationResponse> verifyProvider(
        List<VerificationRequest> requests
    ) {
        List<VerificationResponse> responseList = new List<VerificationResponse>();

        if (requests == null || requests.isEmpty()) {
            VerificationResponse errorResult = new VerificationResponse();
            errorResult.isVerified = false;
            errorResult.message = 'No verification request details provided';
            errorResult.errorType = 'InvalidInputException';
            responseList.add(errorResult);
            return responseList;
        }

        Set<String> providerNames = new Set<String>();
        Set<String> npis = new Set<String>();
        Set<String> normalizedPhones = new Set<String>();
        Map<String, VerificationRequest> requestsByKey = new Map<String, VerificationRequest>();

        for (VerificationRequest request : requests) {
            if (
                request == null ||
                String.isBlank(request.providerName) ||
                String.isBlank(request.npi) ||
                String.isBlank(request.providerPhone)
            ) {
                VerificationResponse errorResult = new VerificationResponse();
                errorResult.isVerified = false;
                errorResult.message = 'All fields are required: providerName, npi, providerPhone';
                errorResult.errorType = 'InvalidInputException';
                responseList.add(errorResult);
                continue;
            }

            String normalizedPhone = normalizePhoneNumber(request.providerPhone);
            providerNames.add(request.providerName.toLowerCase().trim());
            npis.add(request.npi.trim());
            normalizedPhones.add(normalizedPhone);

            String key =
                request.providerName.toLowerCase().trim() +
                '|' +
                request.npi.trim() +
                '|' +
                normalizedPhone;
            requestsByKey.put(key, request);
        }

        List<HealthcareProvider> matchingProviders = [
            SELECT Id, Name, NPI__c, Provider_Phone__c
            FROM HealthcareProvider
            WHERE
                Name IN :providerNames
                AND NPI__c IN :npis
                AND Provider_Phone__c != NULL
            LIMIT 1000
        ];

        Map<String, HealthcareProvider> providersByKey = new Map<String, HealthcareProvider>();
        for (HealthcareProvider provider : matchingProviders) {
            String normalizedProviderPhone = normalizePhoneNumber(provider.Provider_Phone__c);
            String key =
                provider.Name.toLowerCase().trim() +
                '|' +
                provider.NPI__c +
                '|' +
                normalizedProviderPhone;
            if (providersByKey.containsKey(key)) {
                providersByKey.put(key + '|DUPLICATE', provider);
            } else {
                providersByKey.put(key, provider);
            }
        }

        for (String key : requestsByKey.keySet()) {
            VerificationRequest request = requestsByKey.get(key);
            VerificationResponse response = new VerificationResponse();

            try {
                if (providersByKey.containsKey(key + '|DUPLICATE')) {
                    response.isVerified = false;
                    response.message = 'Multiple providers found with the same credentials. Please contact support.';
                    response.errorType = 'MultipleMatchesException';
                } else if (providersByKey.containsKey(key)) {
                    HealthcareProvider matchedProvider = providersByKey.get(key);
                    response.isVerified = true;
                    response.providerId = matchedProvider.Id;
                    response.providerName = matchedProvider.Name;
                    response.message = 'Provider verified successfully';
                } else {
                    response.isVerified = false;
                    response.message = 'No provider found matching the provided credentials';
                    response.errorType = 'NoMatchException';
                }
            } catch (Exception e) {
                response.isVerified = false;
                response.message =
                    'An error occurred during verification: ' + e.getMessage();
                response.errorType = e.getTypeName();
            }
            responseList.add(response);
        }
        return responseList;
    }

    /**
     * Normalizes phone number by removing all non-numeric characters.
     *
     * @param phoneNumber Raw phone number string with potential formatting
     * @return Normalized phone number containing only digits
     */
    private static String normalizePhoneNumber(String phoneNumber) {
        if (String.isBlank(phoneNumber)) {
            return '';
        }
        return phoneNumber.replaceAll('[^0-9]', '');
    }

    /**
     * Input wrapper for provider verification requests.
     * Used by Flows and other invocable contexts to pass provider credentials.
     */
    public class VerificationRequest {
        @InvocableVariable(
            label='Provider Name'
            description='Full name of the provider to verify'
            required=true
        )
        public String providerName;

        @InvocableVariable(
            label='NPI'
            description='National Provider Identifier'
            required=true
        )
        public String npi;

        @InvocableVariable(
            label='Provider Phone'
            description='Provider phone number'
            required=true
        )
        public String providerPhone;
    }

    /**
     * Output wrapper for provider verification results.
     * Returned to Flows and other invocable contexts with verification status.
     */
    public class VerificationResponse {
        @InvocableVariable(
            label='Is Verified'
            description='True if provider was successfully verified'
        )
        public Boolean isVerified;

        @InvocableVariable(
            label='Provider ID'
            description='Salesforce ID of the verified provider'
        )
        public String providerId;

        @InvocableVariable(
            label='Provider Name'
            description='Confirmed name of the verified provider'
        )
        public String providerName;

        @InvocableVariable(
            label='Message'
            description='Success or error message describing the verification result'
        )
        public String message;

        @InvocableVariable(
            label='Error Type'
            description='Type of error if verification failed'
        )
        public String errorType;
    }
}