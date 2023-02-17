import ShrimpClient from "../classes/ShrimpClient";


export default interface ShrimpEvent {
	name: string
	once: boolean
	execute(client: ShrimpClient, ...args: any): Promise<void>;
}