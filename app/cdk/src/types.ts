export type NamingConvention = (name: string) => string;
export interface NamingConventionProps {
  namingConvention: NamingConvention;
}
