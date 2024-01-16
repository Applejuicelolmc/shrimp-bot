import Mustache from 'mustache';
import { ShrimpClient } from '../common/base';

export default async function MustacheHandler(client: ShrimpClient) {
	try {
		// TODO: Grow Moustache
	} catch (error) {
		client.handleError('MustacheHandler', error as Error);
	}
}
