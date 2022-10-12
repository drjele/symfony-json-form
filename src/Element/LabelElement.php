<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class LabelElement extends AbstractElement
{
    public function __construct(
        protected readonly string $name,
        protected readonly string $label
    ) {
    }

    protected function getType(): string
    {
        return 'label';
    }

    protected function renderElement(mixed $value): array
    {
        if (null !== $value && false === \is_scalar($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'value' => $value,
        ];
    }
}
