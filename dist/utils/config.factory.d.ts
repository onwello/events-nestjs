import { NestJSEventsModuleOptions } from '../types/config.types';
/**
 * Factory class for creating NestJS events module options
 * with support for environment variables and sensible defaults
 */
export declare class ConfigFactory {
    /**
     * Create configuration from environment variables with defaults
     */
    static fromEnvironment(): Partial<NestJSEventsModuleOptions>;
    /**
     * Parse cluster nodes from environment variable
     */
    private static parseClusterNodes;
    /**
     * Parse sentinel nodes from environment variable
     */
    private static parseSentinelNodes;
    /**
     * Create Redis transport configuration from environment variables
     */
    static createRedisConfig(): {
        url: string;
        groupId: string;
        batchSize: number;
        enableDLQ: boolean;
        dlqStreamPrefix: string;
        maxRetries: number;
        enableCompression: boolean;
        enablePartitioning: boolean;
        partitionCount: number;
        enableOrdering: boolean;
        enableSchemaManagement: boolean;
        enableMessageReplay: boolean;
    };
    /**
     * Create memory transport configuration from environment variables
     */
    static createMemoryConfig(): {
        originPrefix: string | undefined;
        enablePatternMatching: boolean;
        maxMessageSize: number;
    };
    /**
     * Merge user configuration with environment defaults
     */
    static mergeWithDefaults(userConfig: Partial<NestJSEventsModuleOptions>): NestJSEventsModuleOptions;
}
