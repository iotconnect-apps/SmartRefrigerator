"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
var refrigerator_service_1 = require("./refrigerator.service");
describe('RefrigeratorService', function () {
    beforeEach(function () { return testing_1.TestBed.configureTestingModule({}); });
    it('should be created', function () {
        var service = testing_1.TestBed.get(refrigerator_service_1.RefrigeratorService);
        expect(service).toBeTruthy();
    });
});
//# sourceMappingURL=refrigerator.service.spec.js.map