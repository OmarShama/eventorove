import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

export class SupabaseNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    // Convert camelCase to snake_case for database columns
    columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
        if (customName) return customName;

        // Convert camelCase to snake_case
        return propertyName.replace(/([A-Z])/g, '_$1').toLowerCase();
    }

    // Convert camelCase to snake_case for table names
    tableName(className: string, customName: string): string {
        if (customName) return customName;

        // Convert camelCase to snake_case and pluralize
        const snakeCase = className.replace(/([A-Z])/g, '_$1').toLowerCase();
        return snakeCase.endsWith('s') ? snakeCase : `${snakeCase}s`;
    }

    // Convert camelCase to snake_case for foreign key columns
    joinColumnName(relationName: string, referencedColumnName: string): string {
        return this.camelToSnake(referencedColumnName);
    }

    joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string, secondPropertyName: string): string {
        return `${this.camelToSnake(firstTableName)}_${this.camelToSnake(secondTableName)}`;
    }

    joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
        return `${this.camelToSnake(tableName)}_${this.camelToSnake(columnName || propertyName)}`;
    }

    private camelToSnake(str: string): string {
        return str.replace(/([A-Z])/g, '_$1').toLowerCase();
    }
}
