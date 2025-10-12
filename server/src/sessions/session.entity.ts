import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryColumn('varchar')
  sid: string;

  @Column('jsonb')
  sess: any;

  @Column('timestamp')
  @Index('IDX_session_expire')
  expire: Date;
}