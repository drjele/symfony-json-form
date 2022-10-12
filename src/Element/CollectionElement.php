<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;
use Drjele\Symfony\JsonForm\Traits\ElementCollectionTrait;

/** used for nested elements */
class CollectionElement extends AbstractElement
{
    use ElementCollectionTrait;

    public function __construct(
        protected readonly string $name,
        protected readonly string $label
    ) {
    }

    public function getType(): string
    {
        return 'collection';
    }

    public function renderElement(mixed $value): array
    {
        if (null !== $value && false === \is_array($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'elements' => $this->renderElements($value ?? []),
        ];
    }
}
