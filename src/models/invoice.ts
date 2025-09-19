export interface Invoice {
    id?: number,
    customer: number,
    invoiceNumber: string,
    periodStart: Date,
    periodEnd: Date,
    invDate: Date,
    createDate: Date,
    invAmount: number,
    vatAmount: number,
    vatKey: number
}