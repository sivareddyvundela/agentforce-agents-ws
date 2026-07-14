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
        event.stopPropagation();
        const file = event.target.files[0];
        if (!file) {
            return;
        }
 
        if (file.size > MAX_FILE_SIZE) {
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
            // Strip the "data:<mime>;base64," prefix, keep raw base64 only
            const base64 = reader.result.split(',')[1];
            this.documentName = file.name;
            this.documentBase64 = base64;
            this.emitValueChange();
        };
        reader.onerror = () => {
            this.fileError = 'Unable to read the selected file. Please try again.';
        };
        reader.readAsDataURL(file);
    }
 
    emitValueChange() {
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