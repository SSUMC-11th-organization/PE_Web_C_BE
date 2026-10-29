import { Controller, Get, Param, Query } from '@nestjs/common';
import { MembersService } from './members.service';
@Controller('members')
export class MembersController {
 constructor(private readonly service: MembersService) {}
 @Get('nickname/:nickname') nickname(@Param('nickname') nickname: string) { return this.service.nicknameAvailable(nickname); }
 @Get('email/:email') email(@Param('email') email: string) { return this.service.emailAvailable(email); }
 @Get(':memberId/ratings') ratings(@Param('memberId') memberId: string, @Query('page') page?: string, @Query('size') size?: string) { return this.service.ratingsFor(memberId, page, size); }
}
