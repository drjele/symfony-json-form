<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Element\Contract\AbstractElement;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class LabelElement extends AbstractElement
{
    public function __construct(
        string $name,
        string $label
    ) {
        parent::__construct($name, $label);
    }

    protected function getType(): string
    {
        return 'label';
    }

    protected function renderElement(mixed $value): array
    {
        if (null !== $value && false === \is_scalar($value)) {
            throw new InvalidValueException($this->getName(), $value);
        }

        return [
            'value' => $value,
        ];
    }
}
