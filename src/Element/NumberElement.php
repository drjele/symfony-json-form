<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class NumberElement extends AbstractElement
{
    public function __construct(
        protected readonly string $name,
        protected readonly string $label,
        protected readonly ?float $min = null,
        protected readonly ?float $max = null,
        protected readonly ?float $step = null,
        protected readonly bool $required = true
    ) {
    }

    protected function getType(): string
    {
        return 'number';
    }

    protected function renderElement(mixed $value): array
    {
        if (null !== $value && !\is_numeric($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'min' => $this->min,
            'max' => $this->max,
            'step' => $this->step,
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
