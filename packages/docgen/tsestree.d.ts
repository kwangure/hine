import { TSESTree } from '@typescript-eslint/typescript-estree';
import '@typescript-eslint/typescript-estree';

declare module '@typescript-eslint/typescript-estree' {
    namespace TSESTree {
        interface BaseNode {
            leadingComments?: Comment[];
        }
    }
}