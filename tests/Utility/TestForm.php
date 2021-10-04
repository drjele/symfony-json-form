<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Test\Utility;

use Drjele\Symfony\JsonForm\Element\ArrayElement;
use Drjele\Symfony\JsonForm\Element\AutocompleteElement;
use Drjele\Symfony\JsonForm\Element\BoolElement;
use Drjele\Symfony\JsonForm\Element\DateElement;
use Drjele\Symfony\JsonForm\Element\NumberElement;
use Drjele\Symfony\JsonForm\Element\StringElement;
use Drjele\Symfony\JsonForm\Form\Action;
use Drjele\Symfony\JsonForm\Form\Form;
use Drjele\Symfony\JsonForm\Service\AbstractFormService;

class TestForm extends AbstractFormService
{
    protected function getDtoClass(): string
    {
        return TestDto::class;
    }

    protected function getAction(): Action
    {
        return new Action('test');
    }

    protected function build(Form $form): void
    {
        $form->addElement(
            new ArrayElement(
                'array',
                ['test' => 'test'],
                ArrayElement::MODE_SINGLE,
            )
        )
            ->addElement(
                new AutocompleteElement(
                    'autocomplete',
                    'autocomplete-route',
                    ArrayElement::MODE_SINGLE
                )
            )
            ->addElement(new BoolElement('bool'))
            ->addElement(new DateElement('date'))
            ->addElement(new NumberElement('number', 1, 10, 1))
            ->addElement(new StringElement('string'));
    }
}
