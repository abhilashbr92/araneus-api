import { Injectable } from '@nestjs/common';
import { Customer } from '../../models/customer';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class CustomerService {

    constructor(public logger: PinoLogger) {

    }

    async CreateCustomer(name: any, phone: any) {
        try {
            const existingCustomer = await Customer.findOne({ Phone: phone });
            if (!existingCustomer) {
                const customerInfo = new Customer({ Name: name, Phone: phone });
                const savedCustomer = await customerInfo.save();
                this.logger.info(`Customer saved successfully : ${JSON.stringify(savedCustomer)}`);
                console.log('Customer created successfully');
                return savedCustomer;
            } else {
                throw { message: "Customer already exists with this phone number" };
            }
        } catch (error) {
            this.logger.error(`Error occured in CreateCustomer method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async GetAllCustomers() {
        try {
            const customersList = await Customer.find({});
            return customersList;
        } catch (error) {
            this.logger.error(`Error occured in GetAllCustomers method : ${JSON.stringify(error)}`);
            throw error;
        }
    }

}
