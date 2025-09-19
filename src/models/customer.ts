import type { Biller } from "./biller";

export interface Customer extends Biller{
    token: string,
    hourlyRate: number,
}