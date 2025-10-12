import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    actions?: {
        label: string;
        onClick: () => void;
        variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
        icon?: string;
    }[];
    className?: string;
}

export default function EmptyState({
    icon = "fas fa-inbox",
    title,
    description,
    actions = [],
    className = "",
}: EmptyStateProps) {
    return (
        <div className={`text-center py-16 ${className}`}>
            <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <i className={`${icon} text-3xl text-muted-foreground`}></i>
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground mb-6">{description}</p>

                {actions.length > 0 && (
                    <div className="space-y-3">
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || "default"}
                                onClick={action.onClick}
                                className="w-full"
                            >
                                {action.icon && <i className={`${action.icon} mr-2`}></i>}
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
