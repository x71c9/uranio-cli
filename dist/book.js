"use strict";
/**
 * Project custom book
 *
 * @packageDocumentation
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.atom_book = void 0;
const urn_lib_1 = require("urn-lib");
const uranio_1 = __importDefault(require("uranio"));
const myprodbll_1 = require("./myprodbll");
exports.atom_book = {
    media: {
        api: {
            url: 'medias'
        },
        security: {
            type: uranio_1.default.types.BookSecurityType.UNIFORM
        },
        properties: {
            src: {
                type: uranio_1.default.types.BookPropertyType.TEXT,
                label: 'SRC'
            }
        }
    },
    product: {
        bll: myprodbll_1.my_prod_bll,
        api: {
            url: 'products',
            routes: {
                find: {
                    method: uranio_1.default.types.RouteMethod.GET,
                    action: uranio_1.default.types.AuthAction.READ,
                    url: '/',
                    query: ['filter', 'options'],
                    call: (urn_request) => __awaiter(void 0, void 0, void 0, function* () {
                        console.log('CUSTOOOOM ROUTE');
                        urn_lib_1.urn_log.fn_debug(`CUSTOOOOOM Router Call GET / [product]`);
                        const urn_bll = uranio_1.default.core.bll.create('product', urn_request.token_object);
                        const bll_res = yield urn_bll.find(urn_request.query.filter, urn_request.query.options);
                        return uranio_1.default.core.atm.util.hide_hidden_properties('product', bll_res);
                    })
                },
                find_id: {
                    method: uranio_1.default.types.RouteMethod.GET,
                    action: uranio_1.default.types.AuthAction.READ,
                    url: '/:id',
                    query: ['options'],
                    call: (urn_request) => __awaiter(void 0, void 0, void 0, function* () {
                        console.log('CUSTOOOOM ROUTE');
                        urn_lib_1.urn_log.fn_debug(`CUSTOOOOM Router Call GET /:id [product]`);
                        const urn_bll = uranio_1.default.core.bll.create('product', urn_request.token_object);
                        const bll_res = yield urn_bll.find_by_id(urn_request.params.id, urn_request.query.options);
                        return uranio_1.default.core.atm.util.hide_hidden_properties('product', bll_res);
                    })
                },
            }
        },
        security: {
            type: uranio_1.default.types.BookSecurityType.UNIFORM
        },
        properties: {
            title: {
                type: uranio_1.default.types.BookPropertyType.TEXT,
                label: 'Title',
                optional: true
            },
            images: {
                type: uranio_1.default.types.BookPropertyType.ATOM_ARRAY,
                label: 'Images',
                atom: 'media',
                optional: true
            }
        }
    },
};
//# sourceMappingURL=book.js.map