"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
var maintenance_service_1 = require("./maintenance.service");
describe('MaintenanceService', function () {
    beforeEach(function () { return testing_1.TestBed.configureTestingModule({}); });
    it('should be created', function () {
        var service = testing_1.TestBed.get(maintenance_service_1.MaintenanceService);
        expect(service).toBeTruthy();
    });
});
//# sourceMappingURL=maintenance.service.spec.js.map