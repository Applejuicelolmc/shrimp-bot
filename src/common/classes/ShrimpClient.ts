import { Client } from "discord.js";
import startLogger from "../../handlers/logHandler";
import { normalize, resolve } from "path";

export default class ShrimpClient extends Client {
	private _logger = startLogger(this);
	private _paths = {
		commands: normalize(resolve('.', 'src', `commands`)),
		common: normalize(resolve('.', 'src', `common`)),
		events: normalize(resolve('.', 'src', `events`)),
		handlers: normalize(resolve('.', 'src', `handlers`)),
	}

	get infoLogger() {
		return this._logger.get('info');
	}

	get errorLogger() {
		return this._logger.get('error');
	}

	get debugLogger() {
		return this._logger.get('debug');
	}

	get paths() {
		return this._paths;
	}
}