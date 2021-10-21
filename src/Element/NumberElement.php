<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class NumberElement extends AbstractElement
{
    private ?float $min;
    private ?float $max;
    private ?float $step;
    private bool $required;

    public function __construct(
        string $name,
        float $min = null,
        float $max = null,
        float $step = null,
        bool $required = true
    ) {
        $this->name = $name;
        $this->min = $min;
        $this->max = $max;
        $this->step = $step;
        $this->required = $required;
    }

    protected function getType(): string
    {
        return 'number';
    }

    protected function renderValue($value): array
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
