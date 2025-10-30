import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class WhatsAppMetadataDto {
  @ApiProperty({ example: '5215551234567' })
  @IsString()
  display_phone_number!: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  phone_number_id!: string;
}

export class WhatsAppContactProfileDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  name!: string;
}

export class WhatsAppContactDto {
  @ApiProperty({ type: WhatsAppContactProfileDto })
  @ValidateNested()
  @Type(() => WhatsAppContactProfileDto)
  profile!: WhatsAppContactProfileDto;

  @ApiProperty({ example: '5215551234567' })
  @IsString()
  wa_id!: string;
}

export class WhatsAppTextDto {
  @ApiProperty({ example: 'Hola' })
  @IsString()
  body!: string;
}

export class WhatsAppMediaDto {
  @ApiProperty({ required: false, example: 'Imagen del catálogo' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  mime_type!: string;

  @ApiProperty({ example: 'a1b2c3d4' })
  @IsString()
  sha256!: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  id!: string;
}

export class WhatsAppAudioDto extends WhatsAppMediaDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  voice!: boolean;
}

export class WhatsAppDocumentDto extends WhatsAppMediaDto {
  @ApiProperty({ example: 'manual.pdf' })
  @IsString()
  filename!: string;
}

export class WhatsAppLocationDto {
  @ApiProperty({ example: 19.432608 })
  @IsNumber()
  latitude!: number;

  @ApiProperty({ example: -99.133209 })
  @IsNumber()
  longitude!: number;

  @ApiProperty({ required: false, example: 'Oficina principal' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: 'Av. Reforma 123' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class WhatsAppButtonReplyDto {
  @ApiProperty({ example: 'option-1' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'Primera opción' })
  @IsString()
  title!: string;
}

export class WhatsAppListReplyDto {
  @ApiProperty({ example: 'option-1' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'Primera opción' })
  @IsString()
  title!: string;

  @ApiProperty({ required: false, example: 'Descripción adicional' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class WhatsAppInteractiveDto {
  @ApiProperty({ example: 'button' })
  @IsString()
  type!: string;

  @ApiProperty({ required: false, type: WhatsAppButtonReplyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppButtonReplyDto)
  button_reply?: WhatsAppButtonReplyDto;

  @ApiProperty({ required: false, type: WhatsAppListReplyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppListReplyDto)
  list_reply?: WhatsAppListReplyDto;
}

export class WhatsAppIncomingMessageDto {
  @ApiProperty({ example: '5215551234567' })
  @IsString()
  from!: string;

  @ApiProperty({ example: 'wamid.HBgM...' })
  @IsString()
  id!: string;

  @ApiProperty({ example: '1691234567' })
  @IsString()
  timestamp!: string;

  @ApiProperty({
    example: 'text',
    enum: [
      'text',
      'image',
      'video',
      'audio',
      'document',
      'location',
      'contacts',
      'interactive',
    ],
  })
  @IsString()
  @IsIn([
    'text',
    'image',
    'video',
    'audio',
    'document',
    'location',
    'contacts',
    'interactive',
  ])
  type!: string;

  @ApiProperty({ required: false, type: WhatsAppTextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppTextDto)
  text?: WhatsAppTextDto;

  @ApiProperty({ required: false, type: WhatsAppMediaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppMediaDto)
  image?: WhatsAppMediaDto;

  @ApiProperty({ required: false, type: WhatsAppMediaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppMediaDto)
  video?: WhatsAppMediaDto;

  @ApiProperty({ required: false, type: WhatsAppAudioDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppAudioDto)
  audio?: WhatsAppAudioDto;

  @ApiProperty({ required: false, type: WhatsAppDocumentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppDocumentDto)
  document?: WhatsAppDocumentDto;

  @ApiProperty({ required: false, type: WhatsAppLocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppLocationDto)
  location?: WhatsAppLocationDto;

  @ApiProperty({ required: false, type: WhatsAppInteractiveDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppInteractiveDto)
  interactive?: WhatsAppInteractiveDto;
}

export class WhatsAppStatusConversationOriginDto {
  @ApiProperty({ example: 'business_initiated' })
  @IsString()
  type!: string;
}

export class WhatsAppStatusConversationDto {
  @ApiProperty({ example: '12345' })
  @IsString()
  id!: string;

  @ApiProperty({ type: WhatsAppStatusConversationOriginDto })
  @ValidateNested()
  @Type(() => WhatsAppStatusConversationOriginDto)
  origin!: WhatsAppStatusConversationOriginDto;
}

export class WhatsAppStatusPricingDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  billable!: boolean;

  @ApiProperty({ example: 'CBP' })
  @IsString()
  pricing_model!: string;

  @ApiProperty({ example: 'utility' })
  @IsString()
  category!: string;
}

export class WhatsAppStatusDto {
  @ApiProperty({ example: 'wamid.HBgM...' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'delivered' })
  @IsString()
  status!: string;

  @ApiProperty({ example: '1691234567' })
  @IsString()
  timestamp!: string;

  @ApiProperty({ example: '5215551234567' })
  @IsString()
  recipient_id!: string;

  @ApiProperty({ required: false, type: WhatsAppStatusConversationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppStatusConversationDto)
  conversation?: WhatsAppStatusConversationDto;

  @ApiProperty({ required: false, type: WhatsAppStatusPricingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppStatusPricingDto)
  pricing?: WhatsAppStatusPricingDto;
}

export class WhatsAppValueDto {
  @ApiProperty({ example: 'whatsapp' })
  @IsString()
  messaging_product!: string;

  @ApiProperty({ type: WhatsAppMetadataDto })
  @ValidateNested()
  @Type(() => WhatsAppMetadataDto)
  metadata!: WhatsAppMetadataDto;

  @ApiProperty({ required: false, type: [WhatsAppContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppContactDto)
  contacts?: WhatsAppContactDto[];

  @ApiProperty({ required: false, type: [WhatsAppIncomingMessageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppIncomingMessageDto)
  messages?: WhatsAppIncomingMessageDto[];

  @ApiProperty({ required: false, type: [WhatsAppStatusDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppStatusDto)
  statuses?: WhatsAppStatusDto[];
}

export class WhatsAppChangeDto {
  @ApiProperty({ type: WhatsAppValueDto })
  @ValidateNested()
  @Type(() => WhatsAppValueDto)
  value!: WhatsAppValueDto;

  @ApiProperty({ example: 'messages' })
  @IsString()
  field!: string;
}

export class WhatsAppEntryDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  id!: string;

  @ApiProperty({ type: [WhatsAppChangeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppChangeDto)
  changes!: WhatsAppChangeDto[];
}

export class WhatsAppWebhookDto {
  @ApiProperty({ example: 'whatsapp_business_account' })
  @IsString()
  object!: string;

  @ApiProperty({ type: [WhatsAppEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppEntryDto)
  entry!: WhatsAppEntryDto[];
}

export const WhatsAppWebhookModels = [
  WhatsAppWebhookDto,
  WhatsAppEntryDto,
  WhatsAppChangeDto,
  WhatsAppValueDto,
  WhatsAppIncomingMessageDto,
  WhatsAppContactDto,
  WhatsAppMetadataDto,
  WhatsAppStatusDto,
  WhatsAppStatusConversationDto,
  WhatsAppStatusConversationOriginDto,
  WhatsAppStatusPricingDto,
];
