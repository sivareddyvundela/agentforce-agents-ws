public with sharing class EnrollmentCreationService {
    
    
    
    public class requiredDetails {
        @InvocableVariable(required=true)
        public EnrollmentLightningTypesInput.EnrollmentInputFields enrollmentData;
    }
    
 
    @InvocableMethod(

        label='Create Provider Enrollment Record'

        description='Creates an enrollment record from First Name, Last Name, Phone, Email, NPI Number, License Number, Specialist, Network, and attaches an uploaded supporting document.'

        category='Enrollment'

    )

    public static List<ProviderEnrollmentResult> createEnrollment(List<requiredDetails> requests) {

        List<ProviderEnrollmentResult> results = new List<ProviderEnrollmentResult>();

        List<Enrollment__c> recordsToInsert = new List<Enrollment__c>();
 
        for (requiredDetails req : requests) {
            System.debug('===== ENROLLMENT REQUEST =====');
            System.debug('First Name: ' + req.enrollmentData.firstName);
            
            System.debug('Last Name: ' + req.enrollmentData.lastName);
            System.debug('Document Name: ' + req.enrollmentData.documentName);
            System.debug('Base64 Length: ' + (req.enrollmentData.documentBase64 != null? req.enrollmentData.documentBase64.length(): 0) );

            Enrollment__c enr = new Enrollment__c();

            enr.First_Name__c = req.enrollmentData.firstName;

            enr.Last_Name__c = req.enrollmentData.lastName;

            enr.Phone__c = req.enrollmentData.phone;

            enr.Email__c = req.enrollmentData.email;

            enr.NPI_Number__c = req.enrollmentData.npiNumber;

            enr.License_Number__c = req.enrollmentData.licenseNumber;

            enr.Speciality__c = req.enrollmentData.specialist;

            enr.Network__c = req.enrollmentData.network;

            recordsToInsert.add(enr);

        }
 
        List<Database.SaveResult> saveResults = Database.insert(recordsToInsert, false);
 
        for (Integer i = 0; i < saveResults.size(); i++) {

            ProviderEnrollmentResult result = new ProviderEnrollmentResult();

            Database.SaveResult sr = saveResults[i];

            requiredDetails req = requests[i];
 
            if (sr.isSuccess()) {

                result.isSuccess = true;

                result.enrollmentRecordId = '';

                result.message = 'Enrollment record created successfully.';
 
                if (String.isNotBlank(req.enrollmentData.documentBase64) && String.isNotBlank(req.enrollmentData.documentName)) {

                    try {

                        attachDocument(sr.getId(), req.enrollmentData.documentName, req.enrollmentData.documentBase64);

                        result.message += ' Document attached successfully.';

                    } catch (Exception ex) {

                        result.message += ' Enrollment created, but document attachment failed: ' + ex.getMessage();

                    }

                }

            } else {

                result.isSuccess = false;

                result.enrollmentRecordId = null;

                String errorMsg = '';

                for (Database.Error err : sr.getErrors()) {

                    errorMsg += err.getStatusCode() + ': ' + err.getMessage() + '. ';

                }

                result.message = errorMsg;

            }

            results.add(result);

        }
 
        return results;

    }
 
    private static void attachDocument(Id parentRecordId, String fileName, String base64Data) {
        System.debug('===== ATTACH DOCUMENT =====');
        System.debug('Parent Record Id: ' + parentRecordId);
        System.debug('File Name: ' + fileName);
        System.debug('Base64 Length: ' + base64Data.length());

        ContentVersion cv = new ContentVersion();

        cv.Title = fileName;

        cv.PathOnClient = fileName;

        cv.VersionData = EncodingUtil.base64Decode(base64Data);

        // Setting FirstPublishLocationId to the enrollment record automatically

        // creates the ContentDocumentLink to that record — no manual link needed.

        cv.FirstPublishLocationId = parentRecordId;

        insert cv;
System.debug('ContentVersion Created: ' + cv.Id);
    }

}