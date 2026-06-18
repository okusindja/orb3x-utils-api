import { registerGeoTools } from '@/lib/mcp/tools/geo';

describe('registerGeoTools', () => {
  it('registers geo_provinces, geo_municipalities, geo_communes', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };
    registerGeoTools(mockServer as never);
    expect(registeredTools['geo_provinces']).toBeDefined();
    expect(registeredTools['geo_municipalities']).toBeDefined();
    expect(registeredTools['geo_communes']).toBeDefined();
  });

  it('each tool has non-empty title and description (D-03)', () => {
    const registeredTools: Record<string, { title?: string; description?: string }> = {};
    const mockServer = {
      registerTool: (name: string, meta: { title?: string; description?: string }) => {
        registeredTools[name] = meta;
      },
    };
    registerGeoTools(mockServer as never);
    for (const name of ['geo_provinces', 'geo_municipalities', 'geo_communes']) {
      expect(typeof registeredTools[name]?.title).toBe('string');
      expect((registeredTools[name]?.title ?? '').length).toBeGreaterThan(0);
      expect(typeof registeredTools[name]?.description).toBe('string');
      expect((registeredTools[name]?.description ?? '').length).toBeGreaterThan(0);
    }
  });

  it('geo_provinces happy path: {} returns envelope with country AO and non-empty provinces array', async () => {
    let geoProvincesHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'geo_provinces') geoProvincesHandler = handler;
      },
    };
    registerGeoTools(mockServer as never);
    const result = await geoProvincesHandler!({}) as { content: Array<{ type: string; text: string }> };
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.country).toBe('AO');
    expect(Array.isArray(parsed.provinces)).toBe(true);
    expect(parsed.provinces.length).toBeGreaterThan(0);
  });

  it('geo_municipalities happy path: { province: "Luanda" } returns filtered list', async () => {
    let geoMunicipalitiesHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'geo_municipalities') geoMunicipalitiesHandler = handler;
      },
    };
    registerGeoTools(mockServer as never);
    const result = await geoMunicipalitiesHandler!({ province: 'Luanda' }) as { content: Array<{ type: string; text: string }> };
    const parsed = JSON.parse(result.content[0].text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed.every((m: { province: string }) => m.province === 'Luanda')).toBe(true);
  });

  it('geo_municipalities error path: unknown province returns isError:true code PROVINCE_NOT_FOUND', async () => {
    let geoMunicipalitiesHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'geo_municipalities') geoMunicipalitiesHandler = handler;
      },
    };
    registerGeoTools(mockServer as never);
    const result = await geoMunicipalitiesHandler!({ province: 'Unknown' }) as { isError?: boolean; content: Array<{ text: string }> };
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('PROVINCE_NOT_FOUND');
  });

  it('geo_communes error path: ambiguous municipality returns isError:true code AMBIGUOUS_MUNICIPALITY', async () => {
    let geoCommunesHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'geo_communes') geoCommunesHandler = handler;
      },
    };
    registerGeoTools(mockServer as never);
    // 'Calumbo' exists in both Icolo e Bengo and Luanda provinces — triggers AMBIGUOUS_MUNICIPALITY
    const result = await geoCommunesHandler!({ municipality: 'Calumbo' }) as { isError?: boolean; content: Array<{ text: string }> };
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('AMBIGUOUS_MUNICIPALITY');
  });
});
