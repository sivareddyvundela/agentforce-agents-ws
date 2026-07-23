import { api, LightningElement } from 'lwc';
 
/**
* Enrollment Submission Component
* Collects First Name, Last Name, Phone, Email, NPI Number, License Number,
* Specialist, Network, and a supporting document for enrollment record creation.
* Designed for use in Agentforce agent windows and Flow screens.
*/
 
// Adjust based on your Apex heap/string limits. ~4.5MB keeps base64 well within sync limits.
const MAX_FILE_SIZE = 4500000;
 
export default class EnrollmentSubmission extends LightningElement {
    @api
    get readOnly() {
        return this._readOnly;
    }
 
    set readOnly(value) {
        this._readOnly = value;
    }
    _readOnly = false;
    _value;
 
    @api
    get value() {
        return this._value;
    }
    set value(val) {
        this._value = val;
        if (val) {
            this.firstName = val.firstName || "";
            this.lastName = val.lastName || "";
            this.phone = val.phone || "";
            this.email = val.email || "";
            this.npiNumber = val.npiNumber || "";
            this.licenseNumber = val.licenseNumber || "";
            this.specialist = val.specialist || "";
            this.network = val.network || "";
            this.documentName = val.documentName || "";
            this.documentBase64 = val.documentBase64 || "";
            this.fileName = val.documentName || "";
        }
    }
 
    firstName = "";
    lastName = "";
    phone = "";
    email = "";
    npiNumber = "";
    licenseNumber = "";
    specialist = "";
    network = "";
    documentName = "";
    documentBase64 = "";
 
    fileName = "";
    fileError = "";
 
    // TODO: replace with your actual picklist values (or pull dynamically via getPicklistValues)
    specialistOptions = [
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Dermatology', value: 'Dermatology' },
        { label: 'Family Medicine', value: 'Family Medicine' },
        { label: 'Internal Medicine', value: 'Internal Medicine' },
        { label: 'Neurology', value: 'Neurology' },
        { label: 'Orthopedics', value: 'Orthopedics' },
        { label: 'Pediatrics', value: 'Pediatrics' },
        { label: 'Psychiatry', value: 'Psychiatry' }
    ];
 
    handleInputChange(event) {
        event.stopPropagation();
        const { name, value } = event.target;
        this[name] = value;
        this.emitValueChange();
    }
 
    handleFileUpload(event) {
    console.log('===== FILE UPLOAD FIRED =====');
 
    event.stopPropagation();
 
    const file = event.target.files[0];
 
    console.log('Selected File:', file);
 
    if (!file) {
        console.log('No file selected');
        return;
    }
 
    console.log('File Name:', file.name);
    console.log('File Size:', file.size);
    console.log('File Type:', file.type);
 
    if (file.size > MAX_FILE_SIZE) {
        console.log('File exceeds size limit');
 
        this.fileError = 'File is too large. Please upload a file smaller than 4.5 MB.';
        this.fileName = '';
        this.documentName = '';
        this.documentBase64 = '';
        return;
    }
 
    this.fileError = '';
    this.fileName = file.name;
 
    const reader = new FileReader();
 
    reader.onload = () => {
 
        console.log('===== FILE READ SUCCESSFULLY =====');
 
        const base64 = reader.result.split(',')[1];
 
        console.log('Document Name:', file.name);
        console.log('Base64 Length:', base64.length);
        console.log('Base64 Sample:', base64.substring(0, 100));
 
        this.documentName = file.name;
        this.documentBase64 = "Test";
 
        this.emitValueChange();
    };
 
    reader.onerror = () => {
        console.log('===== FILE READ FAILED =====');
        this.fileError = 'Unable to read the selected file. Please try again.';
    };
 
    reader.readAsDataURL(file);
}
 
    emitValueChange() {
        console.log('Sending to Agentforce:', {firstName: this.firstName,    
                   lastName: this.lastName,
                   documentName: this.documentName,
                   documentBase64Length: this.documentBase64?.length  });
        this.dispatchEvent(
            new CustomEvent("valuechange", {
                detail: {
                    value: {
                        firstName: this.firstName,
                        lastName: this.lastName,
                        phone: this.phone,
                        email: this.email,
                        npiNumber: this.npiNumber,
                        licenseNumber: this.licenseNumber,
                        specialist: this.specialist,
                        network: this.network,
                        documentName: this.documentName,
                        documentBase64: this.documentBase64,
                    },
                },
            }),
        );
    }
}