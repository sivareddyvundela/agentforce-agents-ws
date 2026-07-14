global with sharing class EnrollmentLightningTypesInput {
    
    global class EnrollmentInputFields {
 
    @InvocableVariable(required=true)
    global String firstName;
 
    @InvocableVariable(required=true)
    global String lastName;
 
    @InvocableVariable
    global decimal phone;
 
    @InvocableVariable
    global String email;
 
    @InvocableVariable
    global String npiNumber;
 
    @InvocableVariable
    global String licenseNumber;
 
    @InvocableVariable
    global String specialist;
 
    @InvocableVariable
    global String network;
        
     @InvocableVariable
     global String contentDocumentId;
 
     @InvocableVariable
     global String fileName;
 
}

}