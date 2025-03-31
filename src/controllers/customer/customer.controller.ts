import { Controller, Post, Get, Res, Req, Put, UseGuards, UseFilters } from '@nestjs/common';
import { Response, Request } from 'express';
import { UserAuthGuardService } from '../../services/user-auth-guard/user-auth-guard.service';
import { ExceptionHandler } from 'src/utils/exception-handler/exception-handler';
import { CustomerService } from '../../services/customer/customer.service';
@Controller('api/secure/Customers')
@UseGuards(UserAuthGuardService)
export class CustomerController {

    constructor(public custSrvc: CustomerService) { }

    @Get("List")
    @UseFilters(ExceptionHandler)
    async getCustomersList(@Res() res: Response) {
        const resp = await this.custSrvc.GetAllCustomers();
        res.json(resp);
    }

    @Post('Add')
    async addCustomer(@Req() req: Request, @Res() res: Response) {
        const resp = await this.custSrvc.CreateCustomer(req.body.Name, req.body.Phone);
        res.json(resp);
    }

}