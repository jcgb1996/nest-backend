import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';



import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { JwtPayLoad } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { CreateUserDto, RegisterUserDto, LoginDto, UpdateAuthDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
      @InjectModel(User.name) private userModel: Model<User>,
      private jwtService: JwtService    
    ) {}

   async create(createUserDto: CreateUserDto): Promise<User> {
    
    try {

      const { password, ...userData } = createUserDto; 
      const newUser = new this.userModel( {
        password: bcryptjs.hashSync(password, 10),
        ...userData
      } );

       await  newUser.save();

       const { password:_, ...user } = newUser.toJSON();
       return user;
      
    } 
    catch (error) {
      if(error.code === 11000) throw new BadRequestException(`${ createUserDto.email } ya existe`);

      throw new InternalServerErrorException('error fatal');
    }
    finally{
      console.log('FINALY');
    }

  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {

    const user = await this.create(registerUserDto);
    return {
      user: user,
      token: await this.getJwtToken({ id: user._id})
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {

    const{email, password } = loginDto;

    const user = await this.userModel.findOne({email});
    if(!user) throw new UnauthorizedException('Usuario o contraseña incorrecto');

    if( !bcryptjs.compareSync( password, user.password ) ) throw new  UnauthorizedException('Contraseña incorrecta');
    
    const { password:_, ...rest } = user.toJSON();

    return {
      user: rest,
      token: await this.getJwtToken({ id: user.id})
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string ) {
    const user = await this.userModel.findById( id );

    const { password, ...rest } = user.toJSON();
    
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async getJwtToken(payload: JwtPayLoad): Promise<string> {
    const token = await this.jwtService.signAsync(payload)
    return token;
  }
}
