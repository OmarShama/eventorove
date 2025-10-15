import { User } from '@/types/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Mail, Shield, User as UserIcon } from 'lucide-react';

interface ProfileCardProps {
    user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
    };

    const getRoleBadgeVariant = (role: User['role']) => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'host':
                return 'default';
            case 'guest':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not available';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Card>
            <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user.profileImageUrl || ''} />
                        <AvatarFallback className="text-2xl">
                            {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl">
                            {user.firstName} {user.lastName}
                        </CardTitle>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                            <Shield className="w-3 h-3 mr-1" />
                            {user.role}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                </div>

                {user.emailVerifiedAt && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                        <UserIcon className="w-4 h-4" />
                        <span>Email verified</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
