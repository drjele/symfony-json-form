<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

final class NumberElement extends AbstractElement
{
    private ?int $min;
    private ?int $max;
    private ?float $step;

    public function __construct(
        string $name,
        int $min = null,
        int $max = null,
        float $step = null
    ) {
        $this->name = $name;
        $this->min = $min;
        $this->max = $max;
        $this->step = $step;
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
            'value' => $value,
        ];
    }
}
