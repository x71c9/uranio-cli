/**
 * Service command module
 *
 * @packageDocumentation
 */
import forever from 'forever-monitor';
import { Params } from '../types';
export declare let service_child: forever.Monitor;
export declare function start_service(params: Params): Promise<void>;
export declare function stop_service(params: Params): Promise<void>;
