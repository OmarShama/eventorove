import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CancelBookingDto {
    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsOptional()
    customReason?: string;
}
