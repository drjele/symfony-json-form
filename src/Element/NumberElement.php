<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Element\Contract\AbstractElement;
use Drjele\Symfony\JsonForm\Element\Trait\ReadonlyTrait;
use Drjele\Symfony\JsonForm\Element\Trait\RequiredTrait;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class NumberElement extends AbstractElement
{
    use ReadonlyTrait;
    use RequiredTrait;

    public function __construct(
        string $name,
        string $label,
        protected readonly ?float $min = null,
        protected readonly ?float $max = null,
        protected readonly ?float $step = null
    ) {
        parent::__construct($name, $label);
    }

    protected function getType(): string
    {
        return 'number';
    }

    protected function renderElement(mixed $value): array
    {
        if (null !== $value && !\is_numeric($value)) {
            throw new InvalidValueException($this->getName(), $value);
        }

        return [
            'min' => $this->min,
            'max' => $this->max,
            'step' => $this->step,
            'readonly' => $this->readonly,
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
