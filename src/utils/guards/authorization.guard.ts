import { CanActivate, ExecutionContext, UnauthorizedException, mixin } from "@nestjs/common";

export const AuthorizeGuard = (allowedRoles: string[]) => {
    class RolesGuardMixin implements CanActivate {
        canActivate(context: ExecutionContext): boolean {
            const request = context.switchToHttp().getRequest();
            const result = request?.currentUser?.roles.map(role => allowedRoles?.includes(role)).find((value: boolean) => value === true);
            if (result) {
                return true;
            }
            throw new UnauthorizedException('Unauthorized');
        }
    }
    const guard = mixin(RolesGuardMixin);
    return guard;
}
