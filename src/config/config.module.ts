import { Global, Module, type DynamicModule } from "@nestjs/common";
import { ENVIRONMENT, type Environment } from "./env.validation.js";

@Global()
@Module({})
export class AppConfigModule {
  static register(config: Environment): DynamicModule {
    return {
      module: AppConfigModule,
      providers: [{ provide: ENVIRONMENT, useValue: config }],
      exports: [ENVIRONMENT],
    };
  }
}
