import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport/dist/passport/passport.strategy";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: { headers?: { cookie?: string } }) => {
                    const cookieHeader = request?.headers?.cookie;
                    if (!cookieHeader) return null;
                    const match = cookieHeader
                        .split(';')
                        .map((cookie) => cookie.trim())
                        .find((cookie) => cookie.startsWith('access_token='));
                    if (!match) return null;
                    return match.split('=')[1];
                },
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'defaultSecretKey',
        });
    }
    
    async validate(payload: any) {
        return { address: payload.address };
    }
}