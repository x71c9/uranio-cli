/**
 * Project custom book
 *
 * @packageDocumentation
 */

import {urn_log} from 'urn-lib';

import uranio from 'uranio';

import {my_prod_bll} from './myprodbll';

export const atom_book:uranio.types.Book = {
	media: {
		api: {
			url: 'medias'
		},
		security: {
			type: uranio.types.BookSecurityType.UNIFORM
		},
		properties: {
			src: {
				type: uranio.types.BookPropertyType.TEXT,
				label: 'SRC'
			}
		}
	},
	product: {
		bll: my_prod_bll,
		api: {
			url: 'products',
			routes: {
				find: {
					method: uranio.types.RouteMethod.GET,
					action: uranio.types.AuthAction.READ,
					url: '/',
					query: ['filter', 'options'],
					call: async <D extends uranio.types.Depth>(
						urn_request:uranio.types.RouteRequest
					):Promise<uranio.types.Molecule<'product',D>[]> => {
						console.log('CUSTOOOOM ROUTE');
						urn_log.fn_debug(`CUSTOOOOOM Router Call GET / [product]`);
						const urn_bll = uranio.core.bll.create('product', urn_request.token_object);
						const bll_res = await urn_bll.find<D>(urn_request.query.filter, urn_request.query.options);
						return uranio.core.atm.util.hide_hidden_properties('product', bll_res);
					}
				},
				find_id: {
					method: uranio.types.RouteMethod.GET,
					action: uranio.types.AuthAction.READ,
					url: '/:id',
					query: ['options'],
					call: async <D extends uranio.types.Depth>(
						urn_request:uranio.types.RouteRequest
					):Promise<uranio.types.Molecule<'product',D>> => {
						console.log('CUSTOOOOM ROUTE');
						urn_log.fn_debug(`CUSTOOOOM Router Call GET /:id [product]`);
						const urn_bll = uranio.core.bll.create('product', urn_request.token_object);
						const bll_res = await urn_bll.find_by_id<D>(urn_request.params.id, urn_request.query.options);
						return uranio.core.atm.util.hide_hidden_properties('product', bll_res);
					}
				},
			}
		},
		security: {
			type: uranio.types.BookSecurityType.UNIFORM
		},
		properties: {
			title: {
				type: uranio.types.BookPropertyType.TEXT,
				label: 'Title',
				optional: true
			},
			images: {
				type: uranio.types.BookPropertyType.ATOM_ARRAY,
				label: 'Images',
				atom: 'media',
				optional: true
			}
		}
	},
};



