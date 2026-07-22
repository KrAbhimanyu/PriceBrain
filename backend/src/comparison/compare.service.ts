import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CompareService {
  constructor(private productsService: ProductsService) {}

  async compare(productIds: string[]) {
    const products = await Promise.all(
      productIds.map((id) => this.productsService.findOne(id).catch(() => null))
    );

    const validProducts = products.filter((p) => p !== null);

    // Extract specifications for comparison
    const allSpecs = new Map<string, Map<string, string>>();
    const specKeys = new Set<string>();

    for (const product of validProducts) {
      const productSpecs = new Map<string, string>();
      if (product.specifications) {
        for (const spec of product.specifications) {
          productSpecs.set(spec.key, spec.value);
          specKeys.add(spec.key);
        }
      }
      allSpecs.set(product.id, productSpecs);
    }

    return {
      products: validProducts,
      comparison: {
        keys: Array.from(specKeys),
        data: Object.fromEntries(allSpecs),
      },
    };
  }
}
