<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;
use Drjele\Symfony\JsonForm\Traits\ElementCollectionTrait;

class CollectionElement extends AbstractElement
{
    use ElementCollectionTrait;

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    public function getType(): string
    {
        return 'collection';
    }

    public function renderElement($value): array
    {
        if (null !== $value && !\is_array($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'elements' => $this->renderElements($value ?? []),
        ];
    }
}
