import { AutoRegisterEvents, AutoEvents, AUTO_REGISTER_EVENTS_METADATA } from '../../decorators/auto-register-events.decorator';

describe('AutoRegisterEvents Decorator', () => {
  describe('Basic Functionality', () => {
    it('should apply decorator without options (use all defaults)', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata).toEqual({
        enabled: true,
        strategy: 'decorator',
        priority: 0,
        serviceName: '',
        timing: 'lazy',
        errorHandling: 'warn'
      });
    });

    it('should apply decorator with explicit options', () => {
      @AutoRegisterEvents({
        enabled: false,
        strategy: 'interface',
        priority: 5,
        serviceName: 'custom-service',
        timing: 'immediate',
        errorHandling: 'throw'
      })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata).toEqual({
        enabled: false,
        strategy: 'interface',
        priority: 5,
        serviceName: 'custom-service',
        timing: 'immediate',
        errorHandling: 'throw'
      });
    });

    it('should merge partial options with defaults', () => {
      @AutoRegisterEvents({
        enabled: false,
        priority: 10
      })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata).toEqual({
        enabled: false,
        strategy: 'decorator',      // Default
        priority: 10,               // Custom
        serviceName: '',            // Default
        timing: 'lazy',             // Default
        errorHandling: 'warn'       // Default
      });
    });
  });

  describe('Default Values', () => {
    it('should use enabled: true as default', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.enabled).toBe(true);
    });

    it('should use strategy: decorator as default', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.strategy).toBe('decorator');
    });

    it('should use priority: 0 as default', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.priority).toBe(0);
    });

    it('should use serviceName: empty string as default', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.serviceName).toBe('');
    });

    it('should use timing: lazy as default', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.timing).toBe('lazy');
    });

    it('should use errorHandling: warn as default', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.errorHandling).toBe('warn');
    });
  });

  describe('Option Overrides', () => {
    it('should override enabled option', () => {
      @AutoRegisterEvents({ enabled: false })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.enabled).toBe(false);
    });

    it('should override strategy option', () => {
      @AutoRegisterEvents({ strategy: 'interface' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.strategy).toBe('interface');
    });

    it('should override priority option', () => {
      @AutoRegisterEvents({ priority: 999 })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.priority).toBe(999);
    });

    it('should override serviceName option', () => {
      @AutoRegisterEvents({ serviceName: 'my-custom-service' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.serviceName).toBe('my-custom-service');
    });

    it('should override timing option', () => {
      @AutoRegisterEvents({ timing: 'immediate' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.timing).toBe('immediate');
    });

    it('should override errorHandling option', () => {
      @AutoRegisterEvents({ errorHandling: 'ignore' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.errorHandling).toBe('ignore');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle null options', () => {
      @AutoRegisterEvents(null as any)
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata).toEqual({
        enabled: true,
        strategy: 'decorator',
        priority: 0,
        serviceName: '',
        timing: 'lazy',
        errorHandling: 'warn'
      });
    });

    it('should handle undefined options', () => {
      @AutoRegisterEvents(undefined as any)
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata).toEqual({
        enabled: true,
        strategy: 'decorator',
        priority: 0,
        serviceName: '',
        timing: 'lazy',
        errorHandling: 'warn'
      });
    });

    it('should handle empty object options', () => {
      @AutoRegisterEvents({})
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata).toEqual({
        enabled: true,
        strategy: 'decorator',
        priority: 0,
        serviceName: '',
        timing: 'lazy',
        errorHandling: 'warn'
      });
    });

    it('should handle negative priority', () => {
      @AutoRegisterEvents({ priority: -100 })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.priority).toBe(-100);
    });

    it('should handle very high priority', () => {
      @AutoRegisterEvents({ priority: 999999 })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.priority).toBe(999999);
    });

    it('should handle zero priority', () => {
      @AutoRegisterEvents({ priority: 0 })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.priority).toBe(0);
    });

    it('should handle empty string serviceName', () => {
      @AutoRegisterEvents({ serviceName: '' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.serviceName).toBe('');
    });

    it('should handle whitespace-only serviceName', () => {
      @AutoRegisterEvents({ serviceName: '   ' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.serviceName).toBe('   ');
    });

    it('should handle special characters in serviceName', () => {
      @AutoRegisterEvents({ serviceName: 'service-with-special-chars!@#$%^&*()' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.serviceName).toBe('service-with-special-chars!@#$%^&*()');
    });
  });

  describe('Strategy Options', () => {
    it('should handle strategy: decorator', () => {
      @AutoRegisterEvents({ strategy: 'decorator' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.strategy).toBe('decorator');
    });

    it('should handle strategy: interface', () => {
      @AutoRegisterEvents({ strategy: 'interface' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.strategy).toBe('interface');
    });

    it('should handle strategy: manual', () => {
      @AutoRegisterEvents({ strategy: 'manual' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.strategy).toBe('manual');
    });
  });

  describe('Timing Options', () => {
    it('should handle timing: lazy', () => {
      @AutoRegisterEvents({ timing: 'lazy' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.timing).toBe('lazy');
    });

    it('should handle timing: immediate', () => {
      @AutoRegisterEvents({ timing: 'immediate' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.timing).toBe('immediate');
    });
  });

  describe('Error Handling Options', () => {
    it('should handle errorHandling: throw', () => {
      @AutoRegisterEvents({ errorHandling: 'throw' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.errorHandling).toBe('throw');
    });

    it('should handle errorHandling: warn', () => {
      @AutoRegisterEvents({ errorHandling: 'warn' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.errorHandling).toBe('warn');
    });

    it('should handle errorHandling: ignore', () => {
      @AutoRegisterEvents({ errorHandling: 'ignore' })
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.errorHandling).toBe('ignore');
    });
  });

  describe('Multiple Decorator Applications', () => {
    it('should handle multiple decorators on the same class', () => {
      @AutoRegisterEvents({ enabled: true, priority: 1 })
      @AutoRegisterEvents({ enabled: false, priority: 2 })
      class TestService {}
      
      // First decorator should win (decorators are executed from bottom to top)
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata).toEqual({
        enabled: true,
        strategy: 'decorator',
        priority: 1,
        serviceName: '',
        timing: 'lazy',
        errorHandling: 'warn'
      });
    });

    it('should handle decorator on class with inheritance', () => {
      class BaseService {
        baseValue = 'base';
      }
      
      @AutoRegisterEvents({ priority: 5 })
      class ExtendedService extends BaseService {
        extendedValue = 'extended';
      }
      
      const instance = new ExtendedService();
      
      expect(instance.baseValue).toBe('base');
      expect(instance.extendedValue).toBe('extended');
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, ExtendedService);
      expect(metadata.priority).toBe(5);
    });
  });

  describe('Shorthand Decorator', () => {
    it('should provide AutoEvents shorthand', () => {
      @AutoEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata).toEqual({
        enabled: true,
        strategy: 'decorator',
        priority: 0,
        serviceName: '',
        timing: 'lazy',
        errorHandling: 'warn'
      });
    });

    it('should ensure AutoEvents and AutoRegisterEvents are equivalent', () => {
      @AutoEvents()
      class Service1 {}
      
      @AutoRegisterEvents()
      class Service2 {}
      
      const metadata1 = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, Service1);
      const metadata2 = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, Service2);
      
      expect(metadata1).toEqual(metadata2);
    });
  });

  describe('Metadata Structure Validation', () => {
    it('should include all required metadata fields', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      
      expect(metadata).toHaveProperty('enabled');
      expect(metadata).toHaveProperty('strategy');
      expect(metadata).toHaveProperty('priority');
      expect(metadata).toHaveProperty('serviceName');
      expect(metadata).toHaveProperty('timing');
      expect(metadata).toHaveProperty('errorHandling');
    });

    it('should ensure all fields have correct types', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      
      expect(typeof metadata.enabled).toBe('boolean');
      expect(typeof metadata.strategy).toBe('string');
      expect(typeof metadata.priority).toBe('number');
      expect(typeof metadata.serviceName).toBe('string');
      expect(typeof metadata.timing).toBe('string');
      expect(typeof metadata.errorHandling).toBe('string');
    });

    it('should ensure strategy is one of valid values', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(['decorator', 'interface', 'manual']).toContain(metadata.strategy);
    });

    it('should ensure timing is one of valid values', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(['immediate', 'lazy']).toContain(metadata.timing);
    });

    it('should ensure errorHandling is one of valid values', () => {
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(['throw', 'warn', 'ignore']).toContain(metadata.errorHandling);
    });
  });

  describe('Integration with NestJS', () => {
    it('should work with NestJS Injectable decorator', () => {
      // Simulate NestJS Injectable decorator
      const Injectable = () => (target: any) => {
        // Mock NestJS behavior
      };
      
      @Injectable()
      @AutoRegisterEvents()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.enabled).toBe(true);
    });

    it('should preserve other decorators', () => {
      // Simulate multiple decorators
      const Decorator1 = () => (target: any) => {
        target.decorator1 = true;
      };
      
      const Decorator2 = () => (target: any) => {
        target.decorator2 = true;
      };
      
      @Decorator1()
      @AutoRegisterEvents()
      @Decorator2()
      class TestService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, TestService);
      expect(metadata.enabled).toBe(true);
      expect((TestService as any).decorator1).toBe(true);
      expect((TestService as any).decorator2).toBe(true);
    });
  });

  describe('Complex Configuration Scenarios', () => {
    it('should handle enterprise configuration', () => {
      @AutoRegisterEvents({
        enabled: true,
        strategy: 'interface',
        priority: 100,
        serviceName: 'enterprise-service',
        timing: 'immediate',
        errorHandling: 'throw'
      })
      class EnterpriseService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, EnterpriseService);
      expect(metadata).toEqual({
        enabled: true,
        strategy: 'interface',
        priority: 100,
        serviceName: 'enterprise-service',
        timing: 'immediate',
        errorHandling: 'throw'
      });
    });

    it('should handle minimal configuration', () => {
      @AutoRegisterEvents({
        enabled: false
      })
      class MinimalService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, MinimalService);
      expect(metadata).toEqual({
        enabled: false,
        strategy: 'decorator',
        priority: 0,
        serviceName: '',
        timing: 'lazy',
        errorHandling: 'warn'
      });
    });

    it('should handle high-priority immediate registration', () => {
      @AutoRegisterEvents({
        priority: 999,
        timing: 'immediate',
        errorHandling: 'ignore'
      })
      class HighPriorityService {}
      
      const metadata = Reflect.getMetadata(AUTO_REGISTER_EVENTS_METADATA, HighPriorityService);
      expect(metadata.priority).toBe(999);
      expect(metadata.timing).toBe('immediate');
      expect(metadata.errorHandling).toBe('ignore');
    });
  });
});
