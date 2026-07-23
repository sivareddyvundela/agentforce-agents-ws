/**
 * Provides member verification services for healthcare payer operations.
 * Authenticates members using name, date of birth, and phone number against Account records.
 */
public class MemberVerificationAction {
    /**
     * Verifies member identity using provided MemberName, DOB & Phone Number against Account records.
     *
     * @param requests List of verification requests containing member credentials
     * @return List of verification results indicating success/failure with details
     * @example
     * List<VerificationRequest> requests = new List<VerificationRequest>();
     * VerificationRequest req = new VerificationRequest();
     * req.memberName = 'John Doe';
     * req.dateOfBirth = Date.newInstance(1990, 5, 15);
     * req.phoneNumber = '555-123-4567';
     * requests.add(req);
     * List<VerificationResult> results = MemberVerificationAction.verifyMember(requests);
     */
    @InvocableMethod(
        label='HealthBridge Member Verification'
        description='Verifies member identity using name, date of birth, and phone number'
        category='Member Services'
    )
    public static List<VerificationResponse> verifyMember(
        List<VerificationRequest> requests
    ) {
        // List to store verification results
        List<VerificationResponse> responseList = new List<VerificationResponse>();

        // Check-1: Verify Inputs
        if (requests == null || requests.isEmpty()) {
            VerificationResponse errorResult = new VerificationResponse();
            errorResult.isVerified = false;
            errorResult.message = 'No verification request details provided';
            errorResult.errorType = 'InvalidInputException';
            responseList.add(errorResult);
            return responseList;
        }

        // Check-2: Collect Request's Name, Phone Numbers & Date of Birth for Member Verification
        Set<String> memberNames = new Set<String>();
        Set<Date> datesOfBirth = new Set<Date>();
        Set<String> normalizedPhones = new Set<String>();
        Map<String, VerificationRequest> requestsByKey = new Map<String, VerificationRequest>();

        for (VerificationRequest request : requests) {
            // Check-2a: Verify Details from each Request and filtering those requests has all details to proceed on member verification
            if (
                String.isBlank(request.memberName) ||
                request.dateOfBirth == null ||
                String.isBlank(request.phoneNumber)
            ) {
                VerificationResponse errorResult = new VerificationResponse();
                errorResult.isVerified = false;
                errorResult.message = 'All fields are required: memberName, dateOfBirth, phoneNumber';
                errorResult.errorType = 'InvalidInputException';
                responseList.add(errorResult);
                continue;
            }

            String normalizedPhone = normalizePhoneNumber(request.phoneNumber);
            datesOfBirth.add(request.dateOfBirth);
            normalizedPhones.add(normalizedPhone);
            memberNames.add(request.memberName.toLowerCase().trim());

            // 2b: Create unique key for matching
            String key =
                request.memberName.toLowerCase().trim() +
                '|' +
                String.valueOf(request.dateOfBirth) +
                '|' +
                normalizedPhone;
            requestsByKey.put(key, request);
        }

        // 2c: Query accounts matching any of the provided criteria
        List<Account> matchingAccounts = [
            SELECT Id, Name, PersonBirthdate, Phone
            FROM Account
            WHERE
                Name IN :memberNames
                AND PersonBirthdate IN :datesOfBirth
                AND Phone != NULL
            WITH USER_MODE
            LIMIT 1000
        ];

        // Check-3: Build map of accounts by matching key, Also checking duplicate records
        Map<String, Account> accountsByKey = new Map<String, Account>();
        for (Account acc : matchingAccounts) {
            String normalizedAcctPhone = normalizePhoneNumber(acc.Phone);
            String key =
                acc.Name.toLowerCase().trim() +
                '|' +
                String.valueOf(acc.PersonBirthdate) +
                '|' +
                normalizedAcctPhone;
            if (accountsByKey.containsKey(key)) {
                // Multiple accounts with same credentials - mark for error
                accountsByKey.put(key + '|DUPLICATE', acc);
            } else {
                accountsByKey.put(key, acc);
            }
        }

        // Check-4: Looping all Requests and updating response for each request
        for (String key : requestsByKey.keySet()) {
            VerificationRequest request = requestsByKey.get(key);
            VerificationResponse response = new VerificationResponse();

            try {
                // Check for duplicate marker
                if (accountsByKey.containsKey(key + '|DUPLICATE')) {
                    // Multiple accounts with same credentials - mark for error
                    response.isVerified = false;
                    response.message = 'Multiple members found with the same credentials. Please contact support.';
                    response.errorType = 'MultipleMatchesException';
                } else if (accountsByKey.containsKey(key)) {
                    // Successful match
                    Account matchedAccount = accountsByKey.get(key);
                    response.isVerified = true;
                    response.memberId = matchedAccount.Id;
                    response.memberName = matchedAccount.Name;
                    response.message = 'Member verified successfully';
                } else {
                    // No match found
                    response.isVerified = false;
                    response.message = 'No member found matching the provided credentials';
                    response.errorType = 'NoMatchException';
                }
            } catch (Exception e) {
                response.isVerified = false;
                response.message =
                    'An error occurred during verification: ' + e.getMessage();
                response.errorType = e.getTypeName();
            }
            // Adding Processed Request's results to response to return
            responseList.add(response);
        }
        // returning results for invocable action
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
     * Input wrapper for member verification requests.
     * Used by Flows and other invocable contexts to pass member credentials.
     */
    public class VerificationRequest {
        @InvocableVariable(
            label='Member Name'
            description='Full name of the member to verify'
            required=true
        )
        public String memberName;

        @InvocableVariable(
            label='Date of Birth'
            description='Member date of birth (YYYY-MM-DD)'
            required=true
        )
        public Date dateOfBirth;

        @InvocableVariable(
            label='Phone Number'
            description=' phone number'
            required=true
        )
        public String phoneNumber;
    }

    /**
     * Output wrapper for member verification results.
     * Returned to Flows and other invocable contexts with verification status.
     */
    public class VerificationResponse {
        @InvocableVariable(
            label='Is Verified'
            description='True if member was successfully verified'
        )
        public Boolean isVerified;

        @InvocableVariable(
            label='Member ID'
            description='Salesforce ID of the verified member account'
        )
        public String memberId;

        @InvocableVariable(
            label='Member Name'
            description='Confirmed name of the verified member'
        )
        public String memberName;

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