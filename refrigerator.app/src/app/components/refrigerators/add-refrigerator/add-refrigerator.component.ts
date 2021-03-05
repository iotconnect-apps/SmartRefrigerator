import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MessageAlertDataModel, AppConstant, DeleteAlertDataModel } from '../../../app.constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService, Notification, UserService, LookupService } from '../../../services';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material';
import { RefrigeratorService } from '../../../services/refrigerator/refrigerator.service';
import { MessageDialogComponent, DeleteDialogComponent } from '../..';

@Component({
  selector: 'app-add-refrigerator',
  templateUrl: './add-refrigerator.component.html',
  styleUrls: ['./add-refrigerator.component.css']
})
export class AddRefrigeratorComponent implements OnInit {

  @ViewChild('myFile', { static: false }) myFile: ElementRef;
  @ViewChild('mediaFile', { static: false }) mediaFile: ElementRef;
  MessageAlertDataModel: MessageAlertDataModel;
  deleteAlertDataModel: DeleteAlertDataModel;
  fileUrl: any;
  fileName: any = [];
  fileToUpload: any = [];
  moduleName = "Add Refrigerator";
  typeList: any = [];
  buttonname = 'SUBMIT';
  refrigeratorGuid: any;
  companyId: any;
  isEdit = false;
  refrigeratorForm: FormGroup;
  locationList: any = [];
  selectLocation = "No Location";
  checkSubmitStatus = false;
  selectedFiles: any = [];
  selectedImages: any = [];
  selectedFilesObj: any = [];
  selectedImagesObj: any = [];
  refrigeratorObject: any = {};
  mediaUrl: any;
  currentImage: any;
  hasImage = false;
  handleImgInput = false;
  slideConfig = {
    // 'margin': 15,
    'centerMode': false,
    'infinite': true,
    'dots': false,
    'slidesToShow': 7,
    'slidesToScroll': 1,
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private _notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public userService: UserService,
    public _service: RefrigeratorService,
    public dialog: MatDialog,
    public lookupService: LookupService,
    public _appConstant: AppConstant

  ) {
    this.createFormGroup();
    this.activatedRoute.params.subscribe(params => {
      // set data for parent device
      if (params.refrigeratorGuid != 'add') {
        this.isEdit = true;
        this.getRefrigeratorDetail(params.refrigeratorGuid);
        this.refrigeratorGuid = params.refrigeratorGuid;
        this.moduleName = "Edit Refrigerator";
      } else {
        this.refrigeratorObject = { typeGuid: '', name: '', uniqueId: '', model: '', power: '', voltage: '', capacity: '', netWeight: '', specification: '', description: '', imageFiles: '', mediaFiles: '' }
      }
    });
  }

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companyId = currentUser.userDetail.companyId;
    this.gettypelookup();
    this.getLocationLookup(this.companyId);
  }

  createFormGroup() {

    this.refrigeratorForm = this.formBuilder.group({
      imageFiles: [''],
      mediaFiles: [''],
      entityGuid: ['', Validators.required],
      typeGuid: ['', Validators.required],
      name: ['', [this._notificationService.ValidatorFn, Validators.required]],
      uniqueId: ['', [this._notificationService.ValidatorFn, Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]],
      model: ['', [this._notificationService.ValidatorFn, Validators.required]],
      power: ['', [this._notificationService.ValidatorFn, Validators.required, Validators.pattern(/^[0-9]*\.?[0-9]*$/)]],
      voltage: ['', [this._notificationService.ValidatorFn, Validators.required, Validators.pattern(/^[0-9]*\.?[0-9]*$/)]],
      capacity: ['', [this._notificationService.ValidatorFn, Validators.required, Validators.pattern(/^[0-9]*\.?[0-9]*$/)]],
      netWeight: ['', [this._notificationService.ValidatorFn, Validators.required, Validators.pattern(/^[0-9]*\.?[0-9]*$/)]],
      specification: [''],
      description: ['']
    });
  }

  getRefrigeratorDetail(refrigeratorGuid) {
    this.spinner.show();
    this._service.getRefrigeratorDetails(refrigeratorGuid).subscribe(response => {
      if (response.isSuccess === true) {
        this.spinner.hide();
        this.gettypelookup();
        this.refrigeratorObject = response.data;
        this.refrigeratorObject = response.data;
        this.selectedFilesObj = this.refrigeratorObject.deviceMediaFiles;
        this.selectedImagesObj = this.refrigeratorObject.deviceImageFiles;

        this.refrigeratorForm.get('entityGuid').disable()
        this.refrigeratorForm.get('typeGuid').disable()
        this.refrigeratorForm.get('uniqueId').disable()
      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * Get Type Lookup
   * */
  gettypelookup() {
    this.typeList = [];
    this.lookupService.gettypelookup().
      subscribe(response => {
        if (response.isSuccess === true) {
          this.typeList = response['data'];
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
   * Get Location Lookup by companyId
   * @param companyId
   */
  getLocationLookup(companyId) {
    this._service.getLocationlookup(companyId).
      subscribe(response => {
        if (response.isSuccess === true) {

          this.locationList = response.data;
          this.locationList = this.locationList.filter(word => word.isActive == true);
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  /**
   * Add Refrigerator details
   * */
  addRefrigerator() {
    if (this.isEdit) {
      this.updateRefrigerator();
      return;
    }
    this.checkSubmitStatus = true;
    if (this.refrigeratorForm.status === "VALID") {
      if (this.fileToUpload) {
        this.refrigeratorForm.get('imageFiles').setValue(this.fileToUpload);
      }
      if (this.selectedFiles) {
        this.refrigeratorForm.get('mediaFiles').setValue(this.selectedFiles);
      }
      this.spinner.show();
      var objdata = {
        "entityGuid": this.refrigeratorForm.value.entityGuid,
        "typeGuid": this.refrigeratorForm.value.typeGuid,
        "name": this.refrigeratorForm.value.name,
        "uniqueId": this.refrigeratorForm.value.uniqueId,
        "model": this.refrigeratorForm.value.model,
        "power": this.refrigeratorForm.value.power,
        "voltage": this.refrigeratorForm.value.voltage,
        "capacity": this.refrigeratorForm.value.capacity,
        "netWeight": this.refrigeratorForm.value.netWeight,
        "specification": this.refrigeratorForm.value.specification,
        "description": this.refrigeratorForm.value.description,
        "imageFiles": this.refrigeratorForm.value.imageFiles,
        "mediaFiles": this.refrigeratorForm.value.mediaFiles,
      }
      this._service.namageRefrigerator(objdata).subscribe(response => {
        if (response.isSuccess === true) {
          this.spinner.hide();
          this._notificationService.add(new Notification('success', "Refrigerator created successfully."));
          this.router.navigate(['refrigerators']);
        } else {
          this.spinner.hide();
          this._notificationService.add(new Notification('error', response.message));
        }
      })
    }
  }

  /**
   * Update Refrigerator details
   * */
  updateRefrigerator() {
    this.checkSubmitStatus = true;
    if (this.refrigeratorForm.status === "VALID") {
      this.spinner.show();
      if (this.fileToUpload) {
        this.refrigeratorForm.get('imageFiles').setValue(this.fileToUpload);
      }
      if (this.selectedFiles) {
        this.refrigeratorForm.get('mediaFiles').setValue(this.selectedFiles);
      }
      var objdata = {
        "guid": this.refrigeratorObject.guid,
        "entityGuid": this.refrigeratorObject.entityGuid,
        "typeGuid": this.refrigeratorObject.typeGuid,
        "name": this.refrigeratorForm.value.name,
        "uniqueId": this.refrigeratorObject.uniqueId,
        "model": this.refrigeratorForm.value.model,
        "power": this.refrigeratorForm.value.power,
        "voltage": this.refrigeratorForm.value.voltage,
        "capacity": this.refrigeratorForm.value.capacity,
        "netWeight": this.refrigeratorForm.value.netWeight,
        "specification": this.refrigeratorForm.value.specification,
        "description": this.refrigeratorForm.value.description,
        "imageFiles": this.refrigeratorForm.value.imageFiles,
        "mediaFiles": this.refrigeratorForm.value.mediaFiles,
      }
      this._service.namageRefrigerator(objdata).subscribe(response => {
        if (response.isSuccess === true) {
          this.spinner.hide();
          this._notificationService.add(new Notification('success', "Refrigerator updated successfully."));
          this.router.navigate(['refrigerators']);
        } else {
          this.spinner.hide();
          this._notificationService.add(new Notification('error', response.message));
        }
      })
    }
  }

  /**
   * Validate image
   * @param event
   */
  handleImageInput(event) {
    //this.selectedImages = [];
    //this.fileName = [];
    //this.fileToUpload = [];
    this.handleImgInput = true;
    let files = event.target.files;
    for (let x = 0; x < files.length; x++) {
      let fileType = files.item(x).name.split('.');
      let imagesTypes = ['jpeg', 'JPEG', 'jpg', 'JPG', 'png', 'PNG'];
      if (imagesTypes.indexOf(fileType[fileType.length - 1]) !== -1) {
        this.fileName.push({ name: files.item(x).name });
        this.fileToUpload.push(files.item(x));
        if (event.target.files && event.target.files[x]) {
          var reader = new FileReader();
          reader.readAsDataURL(event.target.files[x]);
          reader.onload = (innerEvent: any) => {
            this.fileUrl = innerEvent.target.result;
            this.selectedImages.push({ url: this.fileUrl, name: files.item(x).name });
          }
        }
      } else {
        this.MessageAlertDataModel = {
          title: "Refrigerator Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
          okButtonName: "OK",
        };
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: 'auto',
          data: this.MessageAlertDataModel,
          disableClose: false
        });
      }
    }
  }

  /**
   * Delete Image confirmation popup
   * */
  deleteImgModel(fileId) {
    this.deleteAlertDataModel = {
      title: "Delete Image",
      message: this._appConstant.msgConfirm.replace('modulename', "Refrigerator Image"),
      okButtonName: "Confirm",
      cancelButtonName: "Cancel",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show();
        this._service.removeMediaImage(this.refrigeratorGuid, fileId).subscribe(response => {
          this.spinner.hide();
          if (response.isSuccess === true) {
            this.selectedImagesObj = this.selectedImagesObj.filter(({ guid }) => guid !== fileId);
            this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Refrigerator Image")));
          } else {
            this._notificationService.add(new Notification('error', response.message));
          }
        }, error => {
          this.spinner.hide();
          this._notificationService.add(new Notification('error', error));
        });
      }
    });
  }

  /**
   * Delete Refrigerator Image
   * */
  deleteRefrigeratorImg() {
    this.spinner.show();
    this._service.removeRefrigeratorImage(this.refrigeratorGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.currentImage = '';
        this.refrigeratorObject['image'] = null;
        this.refrigeratorForm.get('imageFiles').setValue('');
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Refrigerator Image")));
      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  /**
   * Delete Refrigerator file by fileId
   * @param fileId
   */
  removeMediaImage(fileId) {
    this.deleteAlertDataModel = {
      title: "Delete File",
      message: this._appConstant.msgConfirm.replace('modulename', "Media File"),
      okButtonName: "Confirm",
      cancelButtonName: "Cancel",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show();
        this._service.removeMediaImage(this.refrigeratorGuid, fileId).subscribe(response => {
          this.spinner.hide();
          if (response.isSuccess === true) {
            this.selectedFilesObj = this.selectedFilesObj.filter(({ guid }) => guid !== fileId);
            this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Media File")));
          } else {
            this._notificationService.add(new Notification('error', response.message));
          }
        }, error => {
          this.spinner.hide();
          this._notificationService.add(new Notification('error', error));
        });
      }
    });
  }

  /**
   * Remove file from selectedFiles list
   * @param fileName
   */
  fileRemove(fileName): void {
    this.mediaFile.nativeElement.value = "";
    this.selectedFiles = this.selectedFiles.filter(({ name }) => name !== fileName);
  }

  /**
   * Images remove
   * @param imageName
   */
  imagesRemove(imageName): void {
    this.myFile.nativeElement.value = "";
    this.fileName = this.fileName.filter(({ name }) => name !== imageName);
    this.fileToUpload = this.fileToUpload.filter(({ name }) => name !== imageName);
    this.selectedImages = this.selectedImages.filter(({ name }) => name !== imageName);
  }

  /**
   * Handle media files
   * @param event
   */
  handleMediaFileInput(event) {
    //this.selectedFiles = [];
    const fileList: FileList = event.target.files;
    for (let x = 0; x < fileList.length; x++) {
      if (event.target.files[x]) {
        let fileType = fileList.item(x).name.split('.');
        let fileTypes = ['doc', 'DOC', 'docx', 'DOCX', 'pdf', 'PDF'];
        if (fileTypes.indexOf(fileType[fileType.length - 1]) !== -1) {
          this.selectedFiles.push(event.target.files[x]);
        } else {
          this.checkSubmitStatus = false;
          //this.selectedFiles = [];
          this.MessageAlertDataModel = {
            title: "Media Files",
            message: "Invalid File Type.",
            message2: "Upload .doc, .docx, .pdf file Only.",
            okButtonName: "OK",
          };
          const dialogRef = this.dialog.open(MessageDialogComponent, {
            width: '400px',
            height: 'auto',
            data: this.MessageAlertDataModel,
            disableClose: false
          });
          return;
        }
      }

    }
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (innerEvent: any) => {
        //this.fileUrl = innerEvent.target.result;
      }
    }
  }
}
