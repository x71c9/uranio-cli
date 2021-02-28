
import * as book_types from './types';

import {web_atom_book} from 'urn_web/book';

import {urn_log} from 'urn-lib';

import urn_core from 'urn_core';

export const dev_atom_book = {
	...web_atom_book,
	media: {
		api: {
			url: 'medias'
		},
		security: {
			type: book_types.BookSecurityType.UNIFORM
		},
		properties: {
			src: {
				type: book_types.BookPropertyType.TEXT,
				label: 'SRC'
			}
		}
	},
	product: {
		// bll: my_bll,
		api: {
			url: 'products',
			routes: {
				find: {
					method: book_types.RouteMethod.GET,
					action: book_types.AuthAction.READ,
					url: '/',
					query: ['filter', 'options'],
					call: async (urn_request:book_types.RouteRequest) => {
						console.log('CUSTOOOOM ROUTE');
						urn_log.fn_debug(`CUSTOOOOOM Router Call GET / [product]`);
						const urn_bll = urn_core.bll.create('product', urn_request.token_object);
						const bll_res = await urn_bll.find(urn_request.query.filter, urn_request.query.options);
						return urn_core.atm.util.hide_hidden_properties('product', bll_res);
					}
				},
				find_id: {
					method: book_types.RouteMethod.GET,
					action: book_types.AuthAction.READ,
					url: '/:id',
					query: ['options'],
					call: async (urn_request:book_types.RouteRequest) => {
						console.log('CUSTOOOOM ROUTE');
						urn_log.fn_debug(`CUSTOOOOM Router Call GET /:id [product]`);
						const urn_bll = urn_core.bll.create('product', urn_request.token_object);
						const bll_res = await urn_bll.find_by_id(urn_request.params.id, urn_request.query.options);
						return urn_core.atm.util.hide_hidden_properties('product', bll_res);
					}
				},
			}
		},
		security: {
			type: book_types.BookSecurityType.UNIFORM
		},
		properties: {
			title: {
				type: book_types.BookPropertyType.TEXT,
				label: 'Title',
				optional: true
			},
			images: {
				type: book_types.BookPropertyType.ATOM_ARRAY,
				atom: 'media',
				optional: true
			}
		}
	},
	// product2: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product3: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product4: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product5: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product6: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product7: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product8: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product9: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product10: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product11: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product12: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product13: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product14: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product15: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product16: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product17: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product18: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product19: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product20: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product21: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product22: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product23: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product24: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product25: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product26: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product27: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product28: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product29: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product30: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product31: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// },
	// product32: {
	//   api: {
	//     url: 'products'
	//   },
	//   security: {
	//     type: book_types.BookSecurityType.UNIFORM
	//   },
	//   properties: {
	//     title: {
	//       type: book_types.BookPropertyType.TEXT,
	//       label: 'Title',
	//       optional: true
	//     },
	//     images: {
	//       type: book_types.BookPropertyType.ATOM_ARRAY,
	//       atom: 'media',
	//       optional: true
	//     }
	//   }
	// }
} as const;

export const atom_book = {
	...dev_atom_book
} as const;

// export const route_book = {
//   ...dev_route_book
// } as const;


// export const route_book = {
//   validate: {
//     method: 'GET',
//     // action: AuthAction.READ,
//     url: '/validate/:id/:region',
//     client_call: (id:string, region:string, options:Query.Options<'product'>, body:AtomShape<'product'>) => {
//       return {
//         params: {id: id, region: region},
//         query: {options: options},
//         body: body
//       };
//     },
//     server_call: async (params:RouteParams, query:RouteQuery, body:RouteBody, token_object:TokenObject) => {
//       const urn_bll = urn_core.bll.create('user', token_object);
//       console.log(body);
//       return await urn_bll.find_by_id(params.id, query.options);
//     }
//   }
// } as const;

// export type RouteName = keyof typeof route_book;

// export type RouteParams = {
	
// }

// export type ClientReturn = {
//   params: {
//     [k:string]: string
//   },
//   query: any,
//   body: any
// }


// export type RouteBook = {
//   [k:string]: {
//     method: 'GET' | 'POST' | 'DELETE',
//     url:string,
//     client_call: (...args:any) => ClientReturn,
//     server_call: (params: RouteParams, query: RouteQuery, body: RouteBody, token_object:TokenObject) => any
//   }
// }

