import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { JwtPayLoad } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor( private jwtService: JwtService, private authService: AuthService){}

  
  async canActivate(context: ExecutionContext): Promise<boolean>  {

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('token no reconocido');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayLoad>(
        token,
        {
          secret: process.env.JWT_SEED
        }
      );

      const user = await this.authService.findUserById(payload.id);
      console.log({user});
      if(!user) throw new UnauthorizedException('Usuario no existe');
      if(!user.isActive) throw new UnauthorizedException('Usuario no esta activo');
      
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }


    return true;

  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
