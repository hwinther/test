//@ts-nocheck

/**
 * Represents version information for an assembly, including constants, environment name, version, and informational
version.
 */
export interface VersionInformation {
  /**
   * Constants defined in the assembly, if any.
   * @nullable
   */
  readonly constants?: readonly string[] | null
  /**
   * The name of the environment where the application is running.
   * @nullable
   */
  readonly environmentName?: string | null
  /**
   * The informational version of the assembly, which may include additional details.
   * @nullable
   */
  readonly informationalVersion?: string | null
  /**
   * The version of the assembly.
   * @nullable
   */
  readonly version?: string | null
}
