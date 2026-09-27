import { InvalidSalaryError } from "../errors/employee.errors";


export class Salary{
 private constructor(private readonly value: number){}

    static create (value: number): Salary{
        if (value <=0) {
            throw new InvalidSalaryError();
        }
        return new Salary(value);
    }

    getvalue(): number {
        return this.value;
    }

    equals(other: Salary): boolean {
     return this.value === other.value;
    }


}